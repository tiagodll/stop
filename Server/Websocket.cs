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
            var setGame = Db.SetGame(game);
            await Clients.All.SendAsync("GameStarted", game);
        }
    }
}