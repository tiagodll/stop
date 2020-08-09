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
        public Dictionary<string, List<string>> Answers { get; set; } = new Dictionary<string, List<string>>();
    }
}
