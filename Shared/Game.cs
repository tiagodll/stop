using System;
using System.Collections.Generic;
using System.Text;

namespace Stop.Shared
{
    public class Game
    {
        public string Id { get; set; }

        public string Password {get;set;}

        public string HostId { get; set; }

        public int CurrentRound { get; set; } = -1;

        public List<Player> Players { get; set; } = new List<Player>();
        public List<string> Topics {get;set;} = new List<string>();
        public List<Round> Rounds {get;set;} = new List<Round>();
    }
}
