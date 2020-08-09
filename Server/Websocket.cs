using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Stop.Shared;

namespace Stop.Server
{
    public class Websocket : Hub
    {
        private IDatabaseService Db { get; set; }
        public Websocket(IDatabaseService db) => Db = db;

        public async Task StartGame(List<string> topics){
            var game = new Game();
            game.Id = Nanoid.Nanoid.Generate(size:6);
            game.Password = Nanoid.Nanoid.Generate(alphabet:"0123456789abcdefghijklmnopqrstuvxz", size:4);
            game.Topics = topics;
            Db.SaveGame(game);
            await Clients.All.SendAsync("GameStarted", game);
        }

        private string GetRandomLetter() => (char) ('a' + new Random().Next(0, 26)) + "";
        public async Task StartRound(string id){
            var game = Db.FetchGame(id);
            var round = new Round { Letter = GetRandomLetter() };
            // foreach (var player in game.Players)
            // {
            //     var rp = new RoundPlayer();
            //     foreach (var topic in game.Topics)
            //         rp.Answers.Add(topic, new RoundAnswer(""));
            //     
            //     round.Players.Add(player.Name, rp);
            // }
            game.Rounds.Add(round);
            Db.SaveGame(game);
            await Clients.All.SendAsync("RoundStarted", round);
        }
        
        public async Task CloseRound(string id, string name){
            Console.WriteLine($"FinishRound {id} by {name}");
            var game = Db.FetchGame(id);
            await Clients.All.SendAsync("RoundEnded", game.Rounds.Last());
        }

        // public async Task FinishRound(string id, string name){
        //     Console.WriteLine($"FinishRound {id} by {name}");
        //     var game = Db.FetchGame(id);
        //     
        //     // await Clients.All.SendAsync("RoundFinished", game);
        //     game.Rounds[game.Rounds.Count-1].Finished = true;
        //     
        //     foreach (var player in game.Players)
        //     {
        //         foreach (var topic in game.Topics)
        //         {
        //             if (game.Rounds[game.Rounds.Count-1].Players[player.Name].Answers[topic].Answer.StartsWith(game.Rounds.Last().Letter))
        //             {
        //                 game.Rounds[game.Rounds.Count-1].Players[player.Name].Answers[topic].Score += IsAnswerUnique(id, name, topic) ? 2 : 1;
        //             }
        //         }
        //     }
        //     Db.SaveGame(game);
        //     try
        //     {
        //         Console.WriteLine("calling RoundFinished");
        //         await Clients.All.SendAsync("RoundEnded", game);
        //     }
        //     catch (Exception e)
        //     {
        //         Console.WriteLine(e.Message);
        //     }
        // }

        private bool IsAnswerUnique(string id, string name, string topic)
        {
            var game = Db.FetchGame(id);
            // var answer = game.Rounds.Last().Players[name].Answers[topic];
            // foreach (var player in game.Players)
            // {
            //     if(player.Name == name)
            //         continue;
            //
            //     if (game.Rounds.Last().Players[player.Name].Answers[topic] == answer)
            //         return false;
            // }

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
            Console.WriteLine($"{player.Name} has joined {game.Id}");
            await Clients.All.SendAsync("JoinedGame", game);
        }
        
        public async Task LoadRound(string id, string password){
            var game = Db.FetchGame(id);
            await Clients.All.SendAsync("RoundLoaded", game.Rounds.Last());
        }
        
        public async Task DeleteGame(string id, string password){
            Db.DeleteGame(id);
            await Clients.All.SendAsync("GameDeleted", null);
        }

        public async Task SaveAnswers(string id, string playerName, List<string> answers)
        { 
            Console.WriteLine($"{playerName} answered {String.Join(',', answers)}");
            // var game = Db.FetchGame(id);
            // if (!game.Players.Any(x => x.Name == playerName))
            //     return;
            //
            // if (!game.Rounds[game.Rounds.Count-1].Answers.ContainsKey(playerName))
            //     game.Rounds[game.Rounds.Count-1].Answers.Add(playerName, new List<string>());
            //
            // game.Rounds[game.Rounds.Count-1].Answers[playerName] = answers;
            //
            // Db.SaveGame(game);
            await Clients.Caller.SendAsync("AnswersSaved", null);
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