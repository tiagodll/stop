using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Stop.Shared;

namespace Stop.Server
{
    public class Websocket : Hub
    {
        public IDatabaseService Db { get; set; }
        public Websocket(IDatabaseService db) => Db = db;
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public async Task StartGame(List<string> topics){
            var game = new Game();
            game.Id = Nanoid.Nanoid.Generate(size:6);
            game.Password = Nanoid.Nanoid.Generate(size:4);
            game.Topics = topics;
            Db.SaveGame(game);
            await Clients.All.SendAsync("GameStarted", game);
        }
        
        public async Task StartRound(string id){
            var game = Db.FetchGame(id);
            var round = new Round();
            round.Letter = (char)('a' + new Random().Next(0, 26)) + "";
            game.Rounds.Add(round);
            Db.SaveGame(game);
            await Clients.All.SendAsync("RoundStarted", game);
        }
        public async Task FinishRound(string id, string name){
            var game = Db.FetchGame(id);
            game.Rounds.Last().Finished = true;
            foreach (var player in game.Players)
            {
                foreach (var topic in game.Topics)
                {
                    if (game.Rounds.Last().Players[player.Name].Answers[topic].Answer.StartsWith(game.Rounds.Last().Letter))
                    {
                        game.Rounds.Last().Players[player.Name].Answers[topic].Score += IsAnswerUnique(id, name, topic) ? 2 : 1;
                    }
                }
            }
            Db.SaveGame(game);
            await Clients.All.SendAsync("GameLoaded", game);
        }

        public bool IsAnswerUnique(string id, string name, string topic)
        {
            var game = Db.FetchGame(id);
            var answer = game.Rounds.Last().Players[name].Answers[topic];
            foreach (var player in game.Players)
            {
                if(player.Name == name)
                    continue;

                if (game.Rounds.Last().Players[player.Name].Answers[topic] == answer)
                    return false;
            }

            return true;
        }

        public async Task JoinGame(string id, string password, Player player)
        {
            var game = Db.FetchGame(id);
            if (game == null || game.Password != password)
            {
                await Clients.Caller.SendAsync("GameLoaded", null);
                return;
            }

            if(!game.Players.Exists(x => x.Name == player.Name))
                game.Players.Add(player);

            Db.SaveGame(game);
            await Clients.All.SendAsync("JoinedGame", game);
        }
        
        public async Task LoadGame(string id, string password){
            var game = Db.FetchGame(id);
            await Clients.All.SendAsync("GameLoaded", game);
        }
        
        public async Task DeleteGame(string id, string password){
            Db.DeleteGame(id);
            await Clients.All.SendAsync("GameDeleted", null);
        }

        public async Task SaveAnswers(string id, string password, Player player, Dictionary<string, RoundAnswer> answers)
        {
            var game = Db.FetchGame(id);
            if(!game.Rounds.Last().Players.ContainsKey(player.Name))
                game.Rounds.Last().Players.Add(player.Name, new RoundPlayer(){ Answers = answers });
            else
                game.Rounds.Last().Players[player.Name].Answers = answers;
            
            await Clients.All.SendAsync("GameLoaded", game);
        }

        public async Task RenamePlayer(string id, string oldName, string newName)
        {
            var game = Db.FetchGame(id);
            var i = game.Players.FindIndex(x => x.Name == oldName);
            if (i >= 0)
                game.Players[i].Name = newName;
            Db.SaveGame(game);
            
            await Clients.All.SendAsync("GameLoaded", game);
        }
    }
}