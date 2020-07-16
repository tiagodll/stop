using System;
using System.Collections.Generic;
using System.Text;

namespace Stop.Shared
{
    public class Round
    {
        public string Letter { get; set; }
        public bool Finished { get; set; } = false;
        public Dictionary<string, Dictionary<string, string>> Responses { get; set; } = new Dictionary<string, Dictionary<string, string>>();
    }
}
