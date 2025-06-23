export interface WordData {
  Word: string;
  IPA: string;
  PhonicsChunks: string[];
  PhonicsIPA: string[];
  Definition_CN: string;
  Example: string;
  Example_CN: string;
  Audio: string;
  Picture: string;
}

export const sampleWords: WordData[] = [
  {
    Word: "adventure",
    IPA: "/ədˈventʃər/",
    PhonicsChunks: ["ad", "ven", "t", "ure"],
    PhonicsIPA: ["/əd/", "/ven/", "/t/", "/ʃər/"],
    Definition_CN: "n. 冒险；奇遇",
    Example: "We went on an exciting adventure in the mountains.",
    Example_CN: "我们在山里进行了一次激动人心的冒险。",
    Audio: "adventure.mp3",
    Picture: "adventure.jpg"
  },
  {
    Word: "knowledge",
    IPA: "/ˈnɒlɪdʒ/",
    PhonicsChunks: ["know", "l", "edge"],
    PhonicsIPA: ["/nəʊ/", "/l/", "/ɪdʒ/"],
    Definition_CN: "n. 知识；学问",
    Example: "Knowledge is power in today's information age.",
    Example_CN: "在当今信息时代，知识就是力量。",
    Audio: "knowledge.mp3",
    Picture: "knowledge.jpg"
  },
  {
    Word: "strawberry",
    IPA: "/ˈstrɔːbəri/",
    PhonicsChunks: ["str", "aw", "b", "e", "rr", "y"],
    PhonicsIPA: ["/str/", "/ɔː/", "/b/", "/ə/", "/r/", "/i/"],
    Definition_CN: "n. 草莓；草莓色",
    Example: "I love eating fresh strawberries in summer.",
    Example_CN: "我喜欢在夏天吃新鲜的草莓。",
    Audio: "strawberry.mp3",
    Picture: "strawberry.jpg"
  },
  {
    Word: "apple",
    IPA: "/ˈæpəl/",
    PhonicsChunks: ["a", "pp", "le"],
    PhonicsIPA: ["/æ/", "/p/", "/əl/"],
    Definition_CN: "n. 苹果",
    Example: "I eat an apple every day.",
    Example_CN: "我每天吃一个苹果。",
    Audio: "apple.mp3",
    Picture: "apple.jpg"
  },
  {
    Word: "happiness",
    IPA: "/ˈhæpɪnəs/",
    PhonicsChunks: ["hap", "pi", "ness"],
    PhonicsIPA: ["/hæp/", "/pɪ/", "/nəs/"],
    Definition_CN: "n. 幸福；快乐",
    Example: "Happiness comes from within, not from material things.",
    Example_CN: "幸福来自内心，而不是物质。",
    Audio: "happiness.mp3",
    Picture: "happiness.jpg"
  },
  {
    Word: "mountain",
    IPA: "/ˈmaʊntɪn/",
    PhonicsChunks: ["moun", "t", "ain"],
    PhonicsIPA: ["/maʊn/", "/t/", "/ɪn/"],
    Definition_CN: "n. 山；山脉",
    Example: "The mountain peak was covered with snow.",
    Example_CN: "山峰被雪覆盖着。",
    Audio: "mountain.mp3",
    Picture: "mountain.jpg"
  },
  {
    Word: "guitar",
    IPA: "/ɡɪˈtɑːr/",
    PhonicsChunks: ["gui", "t", "ar"],
    PhonicsIPA: ["/ɡɪ/", "/t/", "/ɑːr/"],
    Definition_CN: "n. 吉他",
    Example: "He plays the guitar beautifully.",
    Example_CN: "他弹吉他很好听。",
    Audio: "guitar.mp3",
    Picture: "guitar.jpg"
  },
  {
    Word: "whisper",
    IPA: "/ˈwɪspər/",
    PhonicsChunks: ["whi", "sp", "er"],
    PhonicsIPA: ["/wɪ/", "/sp/", "/ər/"],
    Definition_CN: "v. 低语；耳语",
    Example: "She whispered the secret to her friend.",
    Example_CN: "她向朋友低声说出了秘密。",
    Audio: "whisper.mp3",
    Picture: "whisper.jpg"
  }
];