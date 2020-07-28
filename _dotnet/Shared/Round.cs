using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Stop.Shared
{
    public class Round
    {
        public string Letter { get; set; }
        public bool Finished { get; set; } = false;
        public Dictionary<string, RoundPlayer> Players { get; set; } = new Dictionary<string, RoundPlayer>();
    }

    public class RoundPlayer
    {
        public Dictionary<string, RoundAnswer> Answers { get; set; } = new Dictionary<string, RoundAnswer>();

        public int Score => Answers
            .Where(x => x.Value.Valid)
            .Aggregate(0, (acc, x) => acc + x.Value.Score);
    }

    public class RoundAnswer
    {
        public string Answer { get; set; }
        public bool Valid { get; set; } = true;
        public int Score { get; set; } = 0;

        public RoundAnswer(string answer)
        {
            Answer = answer;
        }
    }
}
