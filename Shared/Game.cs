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

        public List<Player> Players { get; set; }
        public List<string> Topics {get;set;}
        public List<Round> Rounds {get;set;}
    }
}
