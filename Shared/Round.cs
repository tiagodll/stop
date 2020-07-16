using System;
using System.Collections.Generic;
using System.Text;

namespace Stop.Shared
{
    public class Round
    {
        public string Letter { get; set; }
        public bool Finished { get; set; } = false;
        public Dictionary<string, PlayerRound> Players { get; set; } = new Dictionary<string, PlayerRound>();
    }

    public class PlayerRound
    {
        public Dictionary<string, string> Answers { get; set; } = new Dictionary<string, string>();
        public int Score { get; set; } = 0;
    }
}
