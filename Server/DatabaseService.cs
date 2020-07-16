using System.Collections.Generic;
using Stop.Shared;

namespace Stop.Server
{
    public interface IDatabaseService{
        Game FetchGame(string id);
        bool SaveGame(Game game);
        void DeleteGame(string id);
    }
    
    public class DatabaseService : IDatabaseService{
        private static Dictionary<string, Game> games = new Dictionary<string, Game>();

        private static readonly DatabaseService _mySingletonServiceInstance = new DatabaseService();

        public static DatabaseService GetInstance() => _mySingletonServiceInstance;

        public bool SaveGame(Game game){ 
            if(games.ContainsKey(game.Id))
                games[game.Id] = game;
            else
                games.Add(game.Id, game);

            return true;
        }
        public Game FetchGame(string id)
        {
            if (games.ContainsKey(id))
                return games[id];
            
            return null;
        }
        public void DeleteGame(string id)
        {
            if (games.ContainsKey(id))
                games.Remove(id);
        }
    }
}