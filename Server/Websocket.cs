using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Stop.Shared;
using Nanoid;

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
            var setGame = Db.SaveGame(game);
            await Clients.All.SendAsync("GameStarted", game);
        }

        public async Task JoinGame(string id, string password, Player player)
        {
            var game = Db.FetchGame(id);
            if (game == null || game.Password != password)
            {
                await Clients.All.SendAsync("GameLoaded", null);
                return;
            }

            if(!game.Players.Contains(player))
                game.Players.Add(player);

            Db.SaveGame(game);
            await Clients.All.SendAsync("GameLoaded", game);
        }
        public async Task LoadGame(string id, string password){
            var game = Db.FetchGame(id);
            await Clients.All.SendAsync("GameLoaded", game);
        }
    }
}