const fs = require("node:fs");
const path = require("node:path");

const workspace = path.resolve(__dirname, "..");
const lectureRoot = path.resolve(
  "C:/Users/huawei notebook/Desktop/Claude-Workspace/projects/Personal Courses/Lectures"
);
const glossaryFile = path.join(lectureRoot, "Glossaries_All_Courses.md");

const courseConfigs = [
  {
    id: "course-1",
    number: 1,
    directory: "Course 01 - Who Is God",
    files: [
      "Session_01_Existence_and_Incomprehensibility.md",
      "Session_02_Holiness_and_Greatness.md",
      "Session_03_Sovereignty_and_Providence.md",
      "Session_04_Living_for_Gods_Glory.md",
    ],
  },
  {
    id: "course-2",
    number: 2,
    directory: "Course 02 - The Trinity",
    files: [
      "Session_01_Why_the_Trinity_Matters.md",
      "Session_02_The_Father_and_the_Son.md",
      "Session_03_The_Holy_Spirit.md",
      "Session_04_Living_Trinitarian.md",
    ],
  },
  {
    id: "course-3",
    number: 3,
    directory: "Course 03 - Scripture",
    files: [
      "Session_01_Inspiration_and_Authority.md",
      "Session_02_Inerrancy_and_Infallibility.md",
      "Session_03_The_Canon.md",
      "Session_04_Sola_Scriptura.md",
    ],
  },
  {
    id: "course-4",
    number: 4,
    directory: "Course 04 - The Gospel",
    files: [
      "Session_01_Sin_and_Its_Consequences.md",
      "Session_02_Justification_by_Faith_Alone.md",
      "Session_03_Doctrines_of_Grace.md",
      "Session_04_Assurance_and_Perseverance.md",
    ],
  },
  {
    id: "course-5",
    number: 5,
    directory: "Course 05 - Christology",
    files: [
      "Session_01_The_Person_of_Christ.md",
      "Session_02_The_Work_of_Christ_Atonement.md",
      "Session_03_Resurrection_and_Ascension.md",
      "Session_04_Christs_Lordship_in_Daily_Life.md",
    ],
  },
  {
    id: "course-6",
    number: 6,
    directory: "Course 06 - Church History",
    files: [
      "Session_01_Why_History_Matters.md",
      "Session_02_The_Early_Church_and_the_Fathers.md",
      "Session_03_Luther_Calvin_and_the_Reformation.md",
      "Session_04_Reforming_the_Church_Today.md",
    ],
  },
  {
    id: "course-7",
    number: 7,
    directory: "Course 07 - Holiness and Christian Living",
    files: [
      "Session_01_What_Is_Holiness.md",
      "Session_02_Mortification_Putting_Sin_to_Death.md",
      "Session_03_Spiritual_Disciplines_as_Means_of_Grace.md",
      "Session_04_Walking_by_the_Spirit.md",
    ],
  },
  {
    id: "course-8",
    number: 8,
    directory: "Course 08 - Evangelism in the Philippines",
    files: [
      "Session_01_What_Is_the_True_Gospel.md",
      "Session_02_True_Conversion_Repentance_and_Faith.md",
      "Session_03_False_Gospels_and_Gospel_Distortions.md",
      "Session_04_Evangelism_in_the_Philippine_Context.md",
    ],
  },
  {
    id: "course-9",
    number: 9,
    directory: "Course 09 - Apologetics",
    files: [
      "Session_01_What_Is_Apologetics.md",
      "Session_02_The_Modern_Self_Identity_and_Gender.md",
      "Session_03_Social_Justice_Critical_Theory_and_the_Gospel.md",
      "Session_04_Engaging_Filipino_Culture_with_the_Gospel.md",
    ],
  },
  {
    id: "course-10",
    number: 10,
    directory: "Course 10 - Work, Calling, and Productivity",
    files: [
      "Session_01_Work_as_Worship.md",
      "Session_02_Vocation_and_Calling.md",
      "Session_03_Productivity_Time_and_Stewardship.md",
      "Session_04_Technology_Social_Media_and_the_Christian_Life.md",
    ],
  },
  {
    id: "course-11",
    number: 11,
    directory: "Course 11 - Worship and the Church",
    files: [
      "Session_01_What_Is_True_Worship.md",
      "Session_02_The_Church_Its_Nature_and_Marks.md",
      "Session_03_The_Sacraments_Baptism_and_the_Lords_Supper.md",
      "Session_04_Creeds_Confessions_and_Corporate_Identity.md",
    ],
  },
];

const quizzes = {
  "course-1": {
    1: [
      {
        prompt: "What does it mean to say we can know God truly but not exhaustively?",
        options: [
          "God has genuinely revealed Himself, but finite creatures cannot fully comprehend His infinite being.",
          "God can only be known through philosophical arguments, not Scripture.",
          "God is mostly unknowable, so theology should avoid clear claims.",
          "God is fully understandable once we learn enough doctrine.",
        ],
        answerIndex: 0,
        explanation:
          "The session holds together real revelation and creaturely limits: God is truly known because He speaks, but never totally mastered by finite minds.",
      },
      {
        prompt: "Which doctrine teaches that God depends on nothing outside Himself?",
        options: ["Providence", "Aseity", "Concurrence", "General revelation"],
        answerIndex: 1,
        explanation: "Aseity means God is self-existent and self-sufficient; creation adds nothing to Him.",
      },
      {
        prompt: "How should classical arguments for God's existence mainly be used in this session?",
        options: [
          "As conversation openers that show Christian belief is rationally coherent.",
          "As proofs that automatically produce saving faith.",
          "As replacements for Scripture and special revelation.",
          "As arguments useful only for Christians and never for unbelievers.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats the arguments as useful pointers and conversation starters, not stand-alone conversion tools.",
      },
    ],
    2: [
      {
        prompt: "What two dimensions of holiness must be held together?",
        options: [
          "Transcendent otherness and moral purity.",
          "Power and popularity.",
          "Mystery and confusion.",
          "Distance from creation and disinterest in creation.",
        ],
        answerIndex: 0,
        explanation: "Holiness means God is set apart as utterly other and perfectly pure.",
      },
      {
        prompt: "Why are God's incommunicable attributes pastorally important?",
        options: [
          "They show God is not limited like creatures and therefore is worthy of reverent trust.",
          "They make God less involved with ordinary life.",
          "They prove humans can become divine over time.",
          "They are mainly vocabulary for academic theology.",
        ],
        answerIndex: 0,
        explanation:
          "Attributes like omniscience, omnipotence, omnipresence, eternality, and immutability ground worship and confidence.",
      },
      {
        prompt: "What danger appears when worship emphasizes only God's nearness?",
        options: [
          "God may be treated casually, with little reverence for His holiness and greatness.",
          "Christians will become too afraid to pray.",
          "The church will reject God's love.",
          "Scripture memory will become impossible.",
        ],
        answerIndex: 0,
        explanation:
          "The session warns against reducing God to a friendly companion while losing awe before His holy majesty.",
      },
    ],
    3: [
      {
        prompt: "What does providence mean in this session?",
        options: [
          "God preserves, concurs with, and governs all things according to His wise purpose.",
          "God watches creation from a distance without involvement.",
          "God controls only spiritual events, not ordinary causes.",
          "God reacts to history after human choices surprise Him.",
        ],
        answerIndex: 0,
        explanation:
          "Providence includes preservation, concurrence, and government without making God the author of evil.",
      },
      {
        prompt: "What is concurrence?",
        options: [
          "God works through secondary causes without bypassing them.",
          "Human choices happen outside God's rule.",
          "God's will changes when circumstances change.",
          "Suffering always means God has withdrawn.",
        ],
        answerIndex: 0,
        explanation:
          "Concurrence says God's sovereign action and real creaturely action operate together in history.",
      },
      {
        prompt: "How should God's sovereignty shape suffering?",
        options: [
          "It anchors trust that suffering is not random, even when God's purposes are hidden.",
          "It removes the need to lament.",
          "It means evil actions are morally good.",
          "It guarantees Christians will understand every painful event immediately.",
        ],
        answerIndex: 0,
        explanation:
          "The doctrine gives ballast in suffering without pretending every purpose is immediately visible.",
      },
    ],
    4: [
      {
        prompt: "What is the chief end of man?",
        options: [
          "To glorify God and enjoy Him forever.",
          "To discover personal success and protect comfort.",
          "To earn God's approval through achievement.",
          "To divide life into sacred and secular categories.",
        ],
        answerIndex: 0,
        explanation:
          "The session culminates in the doxological end of all theology: God's glory and our joy in Him.",
      },
      {
        prompt: "What does Soli Deo Gloria require?",
        options: [
          "All of life is lived consciously for God's glory.",
          "Only church activities matter spiritually.",
          "Personal ambition is always sinful.",
          "Human relationships are irrelevant to worship.",
        ],
        answerIndex: 0,
        explanation:
          "Soli Deo Gloria refuses a sacred/secular divide and brings work, relationships, ambition, and digital life under God's glory.",
      },
      {
        prompt: "How are idols overcome in this session?",
        options: [
          "By a clearer, more captivating vision of God's glory.",
          "By pretending lesser glories are not attractive.",
          "By replacing doctrine with discipline only.",
          "By withdrawing from every ordinary responsibility.",
        ],
        answerIndex: 0,
        explanation:
          "The answer to glory-stealing idols is not mere effort, but seeing and worshiping the greater glory of God.",
      },
    ],
  },
  "course-2": {
    1: [
      {
        prompt: "What is the classic Trinitarian formula?",
        options: [
          "One God in three persons; one essence, three persons.",
          "Three gods united by one mission.",
          "One person appearing in three temporary modes.",
          "One supreme Father with two lesser divine helpers.",
        ],
        answerIndex: 0,
        explanation:
          "Orthodoxy confesses one divine essence shared fully by Father, Son, and Holy Spirit, with three distinct persons.",
      },
      {
        prompt: "Which heresy says Father, Son, and Spirit are only modes of one person?",
        options: ["Arianism", "Sabellianism or modalism", "Tritheism", "Pelagianism"],
        answerIndex: 1,
        explanation:
          "Modalism collapses the personal distinctions and cannot account for passages where the persons interact.",
      },
      {
        prompt: "Why is salvation Trinitarian?",
        options: [
          "The Father plans, the Son accomplishes, and the Spirit applies redemption.",
          "Each person saves a different kind of believer.",
          "The Spirit replaces the work of the Son after Pentecost.",
          "The Trinity is only a later explanation, not part of salvation.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture frames redemption as Trinitarian from election to application and assurance.",
      },
    ],
    2: [
      {
        prompt: "What does eternal generation teach?",
        options: [
          "The Son is eternally begotten of the Father, not created in time.",
          "The Son became divine at the incarnation.",
          "The Father existed before the Son.",
          "The Son is a lesser divine being.",
        ],
        answerIndex: 0,
        explanation:
          "Eternal generation names the Son's eternal relation to the Father without making Him created or inferior.",
      },
      {
        prompt: "What did Chalcedon protect about Christ?",
        options: [
          "He is one person in two natures, truly God and truly man.",
          "He is two persons sharing one mission.",
          "His human nature replaced His divine nature.",
          "His deity was symbolic rather than real.",
        ],
        answerIndex: 0,
        explanation:
          "Chalcedon guards the unity of Christ's person and the integrity of His divine and human natures.",
      },
      {
        prompt: "Why does the Son's equality make His humility more stunning?",
        options: [
          "Because He had full divine glory and willingly humbled Himself for our salvation.",
          "Because He needed to earn divine status through obedience.",
          "Because He was naturally inferior to the Father.",
          "Because equality with God was only a future reward.",
        ],
        answerIndex: 0,
        explanation:
          "The humility of Philippians 2 is astonishing because the Son who serves is eternally equal with the Father.",
      },
    ],
    3: [
      {
        prompt: "Why must the Holy Spirit be understood as a person?",
        options: [
          "He speaks, grieves, teaches, intercedes, and knows the mind of God.",
          "He is an impersonal power believers can direct.",
          "He is only a symbol for spiritual emotion.",
          "He is a temporary replacement for Christ.",
        ],
        answerIndex: 0,
        explanation:
          "The Spirit's personal actions in Scripture show that He is a divine person, not a force.",
      },
      {
        prompt: "What is Spirit baptism in this session?",
        options: [
          "The Spirit's one-time act of uniting believers to Christ and His body at conversion.",
          "A second-tier experience for unusually mature Christians.",
          "A ritual that only happened before Pentecost.",
          "The same thing as repeated Spirit filling.",
        ],
        answerIndex: 0,
        explanation:
          "The session distinguishes once-for-all Spirit baptism from ongoing Spirit filling.",
      },
      {
        prompt: "What is one central work of the Spirit in the believer?",
        options: [
          "Union with Christ, from which every blessing flows.",
          "Replacing the written Word with private impressions.",
          "Making sanctification unnecessary.",
          "Removing the ordinary means of grace.",
        ],
        answerIndex: 0,
        explanation:
          "The Spirit unites believers to Christ and applies the benefits Christ purchased.",
      },
    ],
    4: [
      {
        prompt: "What shape should Christian prayer normally have?",
        options: [
          "To the Father, through the Son, in the power of the Spirit.",
          "Only to the Spirit, because He is closest to believers.",
          "To whichever person seems most useful at the moment.",
          "Without any Trinitarian structure.",
        ],
        answerIndex: 0,
        explanation:
          "Trinitarian prayer reflects the economy of salvation and Christian access to God.",
      },
      {
        prompt: "How does the Trinity shape Christian community?",
        options: [
          "Unity without uniformity and distinction without division.",
          "Uniformity as the only path to unity.",
          "Individual spirituality without church life.",
          "Hierarchy that treats some people as less valuable.",
        ],
        answerIndex: 0,
        explanation:
          "The triune life gives a pattern for diverse persons held together in love and unity.",
      },
      {
        prompt: "Why is mission Trinitarian?",
        options: [
          "The Father sends, the Son accomplishes redemption, and the Spirit empowers witness.",
          "Mission belongs only to pastors.",
          "Mission replaces worship as the church's final goal.",
          "The Spirit sends the church apart from Christ.",
        ],
        answerIndex: 0,
        explanation:
          "The church's mission flows from the sending God and is empowered by the Spirit for Christ's glory.",
      },
    ],
  },
  "course-3": {
    1: [
      {
        prompt: "What does 2 Timothy 3:16 chiefly teach about Scripture?",
        options: [
          "Scripture is breathed out by God and therefore carries His authority.",
          "Scripture becomes authoritative only after the church approves it.",
          "Scripture contains God's ideas but not necessarily His exact words.",
          "Scripture is mainly valuable because archaeology confirms it.",
        ],
        answerIndex: 0,
        explanation:
          "The session grounds authority in inspiration itself: Scripture is God-breathed, not merely religious reflection.",
      },
      {
        prompt: "What does verbal plenary inspiration mean?",
        options: [
          "Inspiration extends to the very words and to all of Scripture.",
          "God dictated every book mechanically without human personality.",
          "Only doctrinal sections are inspired, not historical ones.",
          "The Bible's message is inspired even if its wording is unreliable.",
        ],
        answerIndex: 0,
        explanation:
          "Verbal means the words matter, and plenary means all of Scripture is inspired.",
      },
      {
        prompt: "Why is external evidence described as secondary in this session?",
        options: [
          "It supports Scripture, but Scripture's final authority rests on God's own self-attesting Word.",
          "Christians should ignore manuscript evidence and history completely.",
          "Evidence is unnecessary because faith has no rational content.",
          "Only personal spiritual experience can prove the Bible true.",
        ],
        answerIndex: 0,
        explanation:
          "Archaeology and manuscript evidence are useful servants, but they do not sit above Scripture as its judge.",
      },
    ],
    2: [
      {
        prompt: "What is the strongest definition of inerrancy used in this course?",
        options: [
          "Scripture, in its original manuscripts, affirms nothing false.",
          "Scripture is usually reliable in spiritual matters but may err in history.",
          "Scripture is inspiring even when its claims are factually uncertain.",
          "Scripture avoids only major theological mistakes.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture presents inerrancy as the necessary consequence of divine inspiration and God's truthfulness.",
      },
      {
        prompt: "How should apparent contradictions normally be handled?",
        options: [
          "With attention to genre, context, historical distance, and textual transmission.",
          "By assuming the Bible is mistaken unless instantly disproved otherwise.",
          "By denying that details in Scripture matter at all.",
          "By treating every difference between accounts as deliberate error.",
        ],
        answerIndex: 0,
        explanation:
          "The session argues for careful interpretation rather than quick charges of error.",
      },
      {
        prompt: "Why does the session say abandoning inerrancy is serious?",
        options: [
          "Because once we judge Scripture by our preferences, Scripture no longer functions as supreme authority.",
          "Because inerrancy matters only for academic apologetics.",
          "Because textual criticism becomes impossible without it.",
          "Because only pastors need confidence in the Bible's truthfulness.",
        ],
        answerIndex: 0,
        explanation:
          "The deeper issue is authority: rejecting inerrancy tends to move final judgment from Scripture to ourselves.",
      },
    ],
    3: [
      {
        prompt: "What does the course mean by 'canon'?",
        options: [
          "The fixed and exclusive list of books recognised as God's written Word.",
          "A church council's power to create Scripture.",
          "Any old religious text valued by Christians.",
          "A tradition of Bible copying in the medieval church.",
        ],
        answerIndex: 0,
        explanation:
          "Canon refers to the measuring rod or standard, not to an arbitrary later invention.",
      },
      {
        prompt: "How does the lecture describe the church's role in the canon?",
        options: [
          "The church recognised books that were already authoritative by divine origin.",
          "The church created authority by voting certain books into Scripture.",
          "The canon remained unknowable until Constantine settled it.",
          "The canon was chosen mainly for political convenience.",
        ],
        answerIndex: 0,
        explanation:
          "Recognition, not invention, is the core distinction stressed throughout the session.",
      },
      {
        prompt: "Why do Protestants reject the Apocrypha as canonical Scripture?",
        options: [
          "It was not part of the Hebrew canon received by Jesus and the apostles and was not recognised as Scripture in the same way.",
          "It contains no useful historical information at all.",
          "It was lost until the Reformation rediscovered it.",
          "It was written after the medieval period.",
        ],
        answerIndex: 0,
        explanation:
          "The session points to its status outside the Hebrew canon and its different authority status in the church.",
      },
    ],
    4: [
      {
        prompt: "What does Sola Scriptura affirm?",
        options: [
          "Scripture alone is the supreme and final authority in matters of faith and life.",
          "Only private Bible reading matters, not the church's teaching.",
          "Tradition, reason, and experience are useless to Christians.",
          "Every question in life is answered by a direct proof text.",
        ],
        answerIndex: 0,
        explanation:
          "The doctrine orders other authorities under Scripture; it does not erase them.",
      },
      {
        prompt: "How does the session define the sufficiency of Scripture?",
        options: [
          "Scripture provides everything needed for faith and life, even if not every decision is addressed directly.",
          "The Bible gives a specific verse for every modern choice we face.",
          "Extra-biblical revelation is usually needed to complete Christian guidance.",
          "Only pastors need Scripture; ordinary believers mainly need experience.",
        ],
        answerIndex: 0,
        explanation:
          "Sufficiency means Scripture equips us with truth, wisdom, and principles for faithful living.",
      },
      {
        prompt: "What is one Philippine-context application named in this session?",
        options: [
          "Cultural loyalties, folk practices, and pastoral authority must all remain under Scripture.",
          "Filipino culture should be rejected in every respect.",
          "Church tradition should automatically outrank Scripture in community life.",
          "Personal prophetic impressions should govern when Scripture seems unclear.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture applies Sola Scriptura by subordinating cultural and institutional pressures to the Word.",
      },
    ],
  },
  "course-4": {
    1: [
      {
        prompt: "Why does this session insist the gospel must begin with sin?",
        options: [
          "Because without a true diagnosis of sin, grace is reduced to flattery or moral improvement.",
          "Because Christians should focus more on guilt than on Christ.",
          "Because the gospel is mainly a message of condemnation.",
          "Because human behavior is the only real problem Scripture addresses.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture argues that the good news makes sense only after the depth of human ruin is understood honestly.",
      },
      {
        prompt: "What does total depravity mean in this session?",
        options: [
          "Sin has affected every part of human nature, leaving no neutral faculty able to turn to God unaided.",
          "Every person is as wicked as they could possibly become.",
          "Human beings can do no socially admirable actions at all.",
          "Only the body is fallen, while the will remains spiritually free.",
        ],
        answerIndex: 0,
        explanation:
          "The point is total pervasiveness, not maximal badness.",
      },
      {
        prompt: "How does the session distinguish Filipino shame from biblical guilt?",
        options: [
          "Shame is social and reputational, while biblical guilt is fundamentally before God.",
          "They are identical categories with identical remedies.",
          "Biblical guilt is mainly about how society sees us.",
          "Shame matters, but guilt does not.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture contrasts hiya with coram Deo guilt to show sin's deepest problem is vertical before God.",
      },
    ],
    2: [
      {
        prompt: "What is justification according to this session?",
        options: [
          "A forensic declaration that the sinner is righteous before God through Christ.",
          "The lifelong process of becoming inwardly holy.",
          "A reward for sincere religious effort.",
          "A mixture of faith and sacramental merit.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture carefully distinguishes justification from sanctification and frames it as a courtroom verdict.",
      },
      {
        prompt: "What is imputation?",
        options: [
          "Christ's righteousness credited to the believer and the believer's sin credited to Christ.",
          "The Spirit slowly improving a person's moral character.",
          "Faith becoming so strong that it earns righteousness.",
          "A church distributing grace through rituals.",
        ],
        answerIndex: 0,
        explanation:
          "Imputation is the double exchange at the heart of justification.",
      },
      {
        prompt: "Why does the session say faith alone is the instrument, not the cause, of justification?",
        options: [
          "Faith receives Christ's righteousness but does not earn or ground the verdict.",
          "Faith is unimportant as long as good works follow.",
          "Faith is the believer's personal righteousness before God.",
          "Faith replaces Christ's work as the basis of acceptance.",
        ],
        answerIndex: 0,
        explanation:
          "The ground of justification is Christ alone; faith is the empty hand that receives Him.",
      },
    ],
    3: [
      {
        prompt: "How does the session frame the Doctrines of Grace?",
        options: [
          "As the shape of a salvation that is entirely God's work from beginning to end.",
          "As a cold philosophical system detached from pastoral life.",
          "As a debate useful only for seminary classrooms.",
          "As five optional opinions with little biblical connection.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture presents TULIP as a hymn of grace, not a merely abstract system.",
      },
      {
        prompt: "What does unconditional election mean here?",
        options: [
          "God chooses His people from mercy and love, not because of foreseen merit or faith.",
          "God elects those who first choose Him sincerely enough.",
          "Election is based mainly on family background and covenant culture.",
          "Election means God saves everyone equally in the end.",
        ],
        answerIndex: 0,
        explanation:
          "Romans 9 is used to show that mercy rests in God's freedom, not in human deserving.",
      },
      {
        prompt: "What is meant by definite atonement in this session?",
        options: [
          "Christ's death actually secured the salvation of the people given to Him by the Father.",
          "Christ's death only made salvation possible without securing anyone's salvation.",
          "The gospel may only be offered to a limited group of hearers.",
          "Christ's sacrifice was too weak for the whole world.",
        ],
        answerIndex: 0,
        explanation:
          "The claim is about the design and accomplishment of the atonement, not about limiting the gospel offer.",
      },
    ],
    4: [
      {
        prompt: "According to this session, what is the primary ground of assurance?",
        options: [
          "The finished work of Christ outside the believer, not fluctuating inner feelings.",
          "A vivid emotional experience of conversion.",
          "Long-term moral performance without failure.",
          "Remembering a past religious decision.",
        ],
        answerIndex: 0,
        explanation:
          "Assurance begins with Christ's objective work, then includes the Spirit's witness and the fruit of change.",
      },
      {
        prompt: "How does the session use union with Christ?",
        options: [
          "As the controlling center of perseverance, because the believer's standing and future are secured in Christ.",
          "As a metaphor useful only for sanctification, not salvation.",
          "As proof that Christians no longer need the church's means of grace.",
          "As a way to deny the seriousness of sin after conversion.",
        ],
        answerIndex: 0,
        explanation:
          "Union with Christ explains why perseverance rests on Christ's hold on the believer, not vice versa.",
      },
      {
        prompt: "What is the difference between losing assurance and losing salvation?",
        options: [
          "Assurance may fluctuate during struggle, but salvation remains secure in Christ.",
          "They are exactly the same thing.",
          "Only morally perfect Christians can keep either one.",
          "Salvation is preserved only by strong self-confidence.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture distinguishes pastoral seasons of doubt from the believer's actual security in Christ.",
      },
    ],
  },
  "course-5": {
    1: [
      {
        prompt: "What does Chalcedon teach about Jesus Christ?",
        options: [
          "He is one person with two complete natures, fully divine and fully human, without confusion, change, division, or separation.",
          "He is two persons, one divine and one human, working together.",
          "He is mainly divine and only appears human.",
          "He is a great human teacher later adopted by God.",
        ],
        answerIndex: 0,
        explanation:
          "The session treats the Chalcedonian definition as the boundary that guards orthodox Christology.",
      },
      {
        prompt: "Why must Jesus be fully God for salvation?",
        options: [
          "Because only a divine Savior can bear infinite wrath, conquer death, and secure salvation completely.",
          "Because divinity only makes His teaching more inspiring.",
          "Because His humanity would otherwise be unnecessary.",
          "Because God needed a symbolic representative rather than a real one.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture argues that a merely human Christ could not carry the weight required for atonement and victory.",
      },
      {
        prompt: "Why must Jesus be fully human?",
        options: [
          "Because He had to represent humanity truly, face real temptation, and sympathize with our weakness.",
          "Because His divinity was set aside permanently.",
          "Because only human suffering matters in redemption.",
          "Because Christ needed to learn morality from experience.",
        ],
        answerIndex: 0,
        explanation:
          "Hebrews is central here: Christ shares our nature so He can serve as merciful High Priest and representative.",
      },
    ],
    2: [
      {
        prompt: "What problem does the cross solve in this session?",
        options: [
          "The just condemnation of sinners before a holy God.",
          "A lack of inspiring moral examples.",
          "Only the social injustice of Roman rule.",
          "Human ignorance about religion in general.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture insists the cross addresses the problem of guilt, justice, and wrath, not mere inspiration.",
      },
      {
        prompt: "What is penal substitution?",
        options: [
          "Christ bore the penalty God's justice required in the place of sinners.",
          "Christ mainly taught people to love one another by dying bravely.",
          "Christ paid a debt to Satan to free humanity.",
          "Christ's death only opened a possibility without accomplishing redemption.",
        ],
        answerIndex: 0,
        explanation:
          "Penal substitution is presented as the central biblical model that grounds the others.",
      },
      {
        prompt: "How does the session respond to the charge of 'cosmic child abuse'?",
        options: [
          "By stressing Trinitarian unity and the Son's willing self-offering within the one saving will of God.",
          "By denying that wrath has anything to do with the cross.",
          "By saying the Father and Son had conflicting intentions.",
          "By replacing substitution with moral influence entirely.",
        ],
        answerIndex: 0,
        explanation:
          "The critique fails because it misreads both divine wrath and the shared will of Father and Son in redemption.",
      },
    ],
    3: [
      {
        prompt: "How does the session describe the resurrection?",
        options: [
          "As a bodily, historical event without which Christianity collapses.",
          "As a metaphor for new beginnings only.",
          "As a private spiritual experience of the disciples.",
          "As an optional doctrine secondary to Jesus's teaching.",
        ],
        answerIndex: 0,
        explanation:
          "1 Corinthians 15 drives the point: if Christ is not raised, faith is futile.",
      },
      {
        prompt: "Which evidence line is used for the resurrection in this session?",
        options: [
          "The empty tomb, post-resurrection appearances, transformed disciples, and the conversions of Paul and James.",
          "A single visionary report with no historical witnesses.",
          "Only the inner feelings of the early church.",
          "Primarily later medieval traditions.",
        ],
        answerIndex: 0,
        explanation:
          "The session gathers several converging historical lines rather than relying on one isolated claim.",
      },
      {
        prompt: "What does the ascension mean according to this session?",
        options: [
          "Christ is enthroned, interceding for His people, and will return bodily.",
          "Christ vanished and is now absent from the church's life.",
          "Christ stopped acting after finishing His earthly ministry.",
          "Christ became only a memory preserved by Scripture.",
        ],
        answerIndex: 0,
        explanation:
          "The ascension is treated as coronation and ongoing priestly ministry, not disappearance.",
      },
    ],
    4: [
      {
        prompt: "What is the Kuyperian vision emphasized in this session?",
        options: [
          "Every square inch of human existence belongs under Christ's authority.",
          "Christ rules church life but not ordinary work or culture.",
          "Believers should withdraw from all cultural engagement.",
          "Only explicitly religious decisions matter to Jesus.",
        ],
        answerIndex: 0,
        explanation:
          "The session applies Christ's Lordship comprehensively across vocation, relationships, and culture.",
      },
      {
        prompt: "How does Christ's Lordship apply to career decisions here?",
        options: [
          "Work and ambition must be shaped by Christ's call, not simply by prestige, pressure, or family expectation.",
          "Career choices are spiritually neutral and outside discipleship.",
          "Only church ministry can honor Christ.",
          "Income alone should determine vocation.",
        ],
        answerIndex: 0,
        explanation:
          "Colossians 3 reframes work as service rendered before the Lord Christ.",
      },
      {
        prompt: "What is one mark of resisting Christ's Lordship in this session?",
        options: [
          "Compartmentalizing faith so Jesus governs only selected parts of life.",
          "Taking Scripture seriously in daily decisions.",
          "Submitting culture and relationships to biblical discernment.",
          "Viewing Christ as preeminent over all things.",
        ],
        answerIndex: 0,
        explanation:
          "The closing warning is against a segmented Christianity where Christ rules Sunday but not the rest of life.",
      },
    ],
  },
  "course-6": {
    1: [
      {
        prompt: "Why does this session argue church history matters for ordinary Christians?",
        options: [
          "Because it helps believers remember God's faithfulness, avoid old errors, and grow in humility and courage.",
          "Because history is useful only for pastors and professors.",
          "Because doctrine changes so often that the past is mostly irrelevant.",
          "Because historical study replaces the need to read Scripture carefully.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture frames history as a discipleship tool that steadies the church through memory, warning, and encouragement.",
      },
      {
        prompt: "What danger comes from historical ignorance in the church?",
        options: [
          "The church becomes vulnerable to repeating old heresies and acting as if present problems are entirely new.",
          "Christians will care too much about doctrine.",
          "Believers will stop valuing Scripture.",
          "The church will become unable to do evangelism at all.",
        ],
        answerIndex: 0,
        explanation:
          "The session emphasizes that many contemporary confusions are recycled errors the church has already had to answer.",
      },
      {
        prompt: "How should church history function in relation to Scripture?",
        options: [
          "As a servant that helps us read Scripture wisely, not as a rival authority over Scripture.",
          "As a final authority that corrects Scripture when needed.",
          "As a purely optional hobby unrelated to doctrine.",
          "As a replacement for theology because narratives are easier than doctrine.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture keeps history under the authority of Scripture while still treating it as an important guide for the church.",
      },
    ],
    2: [
      {
        prompt: "Why were the early creeds and councils so important?",
        options: [
          "They helped the church defend biblical truth about Christ and the Trinity against serious doctrinal error.",
          "They created new doctrines with no biblical basis.",
          "They proved theology should be left to emperors rather than pastors.",
          "They mattered only for political unity, not for truth.",
        ],
        answerIndex: 0,
        explanation:
          "The session presents the creeds and councils as the church's careful defense of scriptural orthodoxy.",
      },
      {
        prompt: "What is one major lesson drawn from the church fathers in this session?",
        options: [
          "We should read them appreciatively but critically, learning from their strengths without treating them as infallible.",
          "Everything they wrote is beyond criticism.",
          "Their writings are useless because they lived too early.",
          "Only monastic writers are worth reading today.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture recommends gratitude and discernment rather than blind acceptance or dismissive neglect.",
      },
      {
        prompt: "What struggle defined much of the early church period covered here?",
        options: [
          "Clarifying orthodox doctrine while facing persecution, false teaching, and questions about Christ's person.",
          "Deciding whether the Old Testament should be removed from Christian use.",
          "Replacing preaching with philosophy entirely.",
          "Abandoning worship in favor of private spirituality.",
        ],
        answerIndex: 0,
        explanation:
          "The early church had to confess biblical doctrine clearly under pressure from both persecution and heresy.",
      },
    ],
    3: [
      {
        prompt: "What central Reformation conviction is emphasized in this session?",
        options: [
          "The church must be reformed by the Word of God, especially in the gospel of justification by faith alone.",
          "Tradition should always outrank Scripture in church reform.",
          "Moral reform is enough even without doctrinal reform.",
          "The Reformation was mainly a political revolt with little theological substance.",
        ],
        answerIndex: 0,
        explanation:
          "Luther and Calvin are presented as reformers whose driving concern was the recovery of the gospel and biblical authority.",
      },
      {
        prompt: "Why did justification by faith alone matter so much to Luther?",
        options: [
          "Because it answered the problem of a guilty conscience by grounding acceptance with God in Christ rather than human merit.",
          "Because it denied the need for holiness altogether.",
          "Because it made the church unnecessary.",
          "Because it reduced salvation to political freedom.",
        ],
        answerIndex: 0,
        explanation:
          "The session highlights Luther's discovery that peace with God rests on Christ's righteousness received by faith.",
      },
      {
        prompt: "How is Calvin mainly portrayed in this session?",
        options: [
          "As a reformer who joined doctrinal clarity, careful exegesis, and a vision for ordered church life under Christ.",
          "As someone interested only in abstract speculation.",
          "As a figure who rejected pastoral ministry in favor of politics.",
          "As a thinker who minimized Scripture in theology.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture stresses Calvin's biblical rigor, pastoral concern, and institutional reforms in church life.",
      },
    ],
    4: [
      {
        prompt: "What does 'the church reformed and always reforming' mean in this session?",
        options: [
          "The church must keep submitting its doctrine and practice to Scripture rather than assuming present habits are beyond correction.",
          "The church should reinvent its message every generation.",
          "Historic confessions should be discarded as quickly as possible.",
          "Reform means adjusting style only, not truth or worship.",
        ],
        answerIndex: 0,
        explanation:
          "The closing session defines reform as ongoing biblical evaluation, not novelty for its own sake.",
      },
      {
        prompt: "How should history shape present-day church ministry according to this lecture?",
        options: [
          "It should produce humility, gratitude, doctrinal seriousness, and wisdom for present faithfulness.",
          "It should keep the church frozen in one century.",
          "It should discourage evangelism and mission.",
          "It should replace pastoral application with academic debate.",
        ],
        answerIndex: 0,
        explanation:
          "The session treats historical study as fuel for wiser ministry rather than nostalgia or antiquarianism.",
      },
      {
        prompt: "What is one mark of a church being reformed today?",
        options: [
          "A willingness to test preaching, worship, discipleship, and leadership by Scripture and repent where needed.",
          "A refusal to learn from any past generation.",
          "An obsession with trends over doctrine.",
          "A belief that visible growth alone proves faithfulness.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture closes by connecting reformation to concrete repentance and renewed alignment with biblical truth.",
      },
    ],
  },
  "course-7": {
    1: [
      {
        prompt: "How does this session define holiness most fundamentally?",
        options: [
          "Holiness is conformity to God's character, set apart unto Him in union with Christ.",
          "Holiness is mainly external rule-keeping that earns God's favor.",
          "Holiness is withdrawal from ordinary responsibilities.",
          "Holiness is a personality trait for especially serious Christians.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture frames holiness as belonging to God and reflecting His character, not as merit-based self-improvement.",
      },
      {
        prompt: "Why must the gospel shape the pursuit of holiness?",
        options: [
          "Because holiness flows from grace and union with Christ rather than from attempts to justify ourselves.",
          "Because obedience is unnecessary once grace is understood.",
          "Because sanctification replaces justification.",
          "Because only spiritual elites can pursue real holiness.",
        ],
        answerIndex: 0,
        explanation:
          "The session keeps sanctification downstream from justification so obedience remains grateful and Spirit-enabled.",
      },
      {
        prompt: "What danger does the lecture warn against when discussing holiness?",
        options: [
          "Reducing holiness either to legalism or to a vague spirituality without obedience.",
          "Reading Scripture too carefully.",
          "Taking sin more seriously than society does.",
          "Using the language of discipleship in church life.",
        ],
        answerIndex: 0,
        explanation:
          "The session rejects both rigid moralism and contentless spirituality, insisting on biblical obedience shaped by grace.",
      },
    ],
    2: [
      {
        prompt: "What is mortification according to this session?",
        options: [
          "A Spirit-dependent putting of sin to death through repentance, watchfulness, and faith in Christ.",
          "Ignoring sin so it loses power over time.",
          "Punishing the body to earn holiness.",
          "Confessing sin once without ongoing resistance.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture follows the classic Reformed emphasis that sin must be actively fought by the Spirit, not passively tolerated.",
      },
      {
        prompt: "Why is indwelling sin still a serious issue for believers?",
        options: [
          "Because remaining sin continues to war against obedience and must not be treated casually.",
          "Because Christians are no different from unbelievers.",
          "Because assurance depends on total perfection.",
          "Because grace removes the need for vigilance.",
        ],
        answerIndex: 0,
        explanation:
          "The session stresses that believers are justified yet still engaged in real conflict with remaining sin.",
      },
      {
        prompt: "What practical pattern supports mortification in this lecture?",
        options: [
          "Identifying sin honestly, bringing it to Scripture, and actively resisting it in dependence on the Spirit.",
          "Waiting for temptation to disappear on its own.",
          "Treating guilt as the main engine of change.",
          "Hiding sinful habits to protect appearances.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats mortification as honest, concrete, and prayerful warfare rather than vague moral aspiration.",
      },
    ],
    3: [
      {
        prompt: "How are spiritual disciplines described in this session?",
        options: [
          "As means of grace through which God strengthens His people, not techniques for self-salvation.",
          "As optional habits unrelated to growth in holiness.",
          "As replacements for the ministry of the church.",
          "As practices valuable only for pastors.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture presents the disciplines as ordinary channels God uses to nourish believers by His grace.",
      },
      {
        prompt: "What is the difference between using disciplines rightly and wrongly?",
        options: [
          "Right use seeks communion with God in faith; wrong use treats the disciplines as performance or leverage.",
          "Right use avoids structure; wrong use plans time for Scripture and prayer.",
          "Right use isolates believers from the church; wrong use includes worship.",
          "Right use emphasizes effort alone; wrong use depends on grace.",
        ],
        answerIndex: 0,
        explanation:
          "The session warns against turning good practices into ladders of self-righteousness.",
      },
      {
        prompt: "Which combination best matches the means of grace emphasized here?",
        options: [
          "Scripture, prayer, gathered worship, and the ordinary life of discipleship in the church.",
          "Private visions, novelty, and extreme asceticism.",
          "Academic study without prayer or worship.",
          "Spontaneous spirituality detached from habits.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture keeps growth rooted in ordinary, biblical patterns rather than dramatic or self-invented methods.",
      },
    ],
    4: [
      {
        prompt: "What does walking by the Spirit mean in this session?",
        options: [
          "Living in conscious dependence on the Spirit so that obedience and fruit increasingly mark everyday life.",
          "Waiting passively for holiness without effort.",
          "Following inner impressions apart from Scripture.",
          "Achieving sinless perfection in this life.",
        ],
        answerIndex: 0,
        explanation:
          "The session joins Spirit-dependence with active obedience rather than treating them as opposites.",
      },
      {
        prompt: "How is the fruit of the Spirit treated in the lecture?",
        options: [
          "As the visible evidence of Spirit-led transformation in character and relationships.",
          "As a list for self-congratulation.",
          "As a substitute for repentance.",
          "As something unrelated to ordinary church life.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats the fruit of the Spirit as the outworking of God's sanctifying presence in real life.",
      },
      {
        prompt: "What is one sign that someone is not walking by the Spirit?",
        options: [
          "Persistently gratifying the flesh while refusing repentance, accountability, or Scripture-shaped obedience.",
          "Feeling weak and asking for help in prayer.",
          "Using means of grace consistently.",
          "Seeking to grow in self-control and love.",
        ],
        answerIndex: 0,
        explanation:
          "The closing emphasis is practical: Spirit-led holiness shows itself in repentance, obedience, and growing fruit.",
      },
    ],
  },
  "course-8": {
    1: [
      {
        prompt: "What is the core message of the true gospel in this session?",
        options: [
          "God saves guilty sinners through the life, death, and resurrection of Jesus Christ, received by grace through faith.",
          "God helps sincere people improve themselves enough to be accepted.",
          "The gospel is mainly advice for living a meaningful life.",
          "The gospel promises material blessing to those with enough faith.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture centers the gospel on Christ's saving work for sinners rather than on self-improvement or prosperity.",
      },
      {
        prompt: "Why does the session insist on defining the gospel carefully?",
        options: [
          "Because vague or distorted gospel language can leave people religious without being reconciled to God.",
          "Because doctrine matters only for specialists.",
          "Because evangelism works best when the message stays unclear.",
          "Because all gospel presentations are equally faithful.",
        ],
        answerIndex: 0,
        explanation:
          "The session treats precision as pastoral, since false assurance can grow where the gospel is blurred.",
      },
      {
        prompt: "What is one false substitute for the gospel rejected here?",
        options: [
          "Reducing Christianity to moral advice or personal uplift instead of Christ's saving work.",
          "Preaching Christ crucified and risen.",
          "Calling sinners to repentance and faith.",
          "Explaining grace and substitution clearly.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture warns against replacing the gospel announcement with therapeutic or moralistic messaging.",
      },
    ],
    2: [
      {
        prompt: "How does this session describe true conversion?",
        options: [
          "A real turning to God in repentance and faith produced by the Spirit through the gospel.",
          "A temporary emotional response at an event.",
          "A cultural decision to join church activity.",
          "A moment that removes the need for ongoing discipleship.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture distinguishes biblical conversion from mere decisions, pressure responses, or outward affiliation.",
      },
      {
        prompt: "What is repentance according to this lecture?",
        options: [
          "A sincere turning from sin to God that involves mind, heart, and life.",
          "Feeling embarrassed for a short time without change.",
          "Paying for past mistakes through religious effort.",
          "Replacing one visible sin with a more respectable one.",
        ],
        answerIndex: 0,
        explanation:
          "Repentance is presented as a grace-enabled reorientation toward God, not mere regret or self-punishment.",
      },
      {
        prompt: "How is saving faith described here?",
        options: [
          "Resting on Christ alone for righteousness and salvation, not on personal worthiness or religious effort.",
          "Believing God exists while continuing unchanged.",
          "Trusting feelings more than Scripture.",
          "Adding Jesus to an already acceptable life.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture emphasizes personal trust in Christ rather than bare assent or confidence in oneself.",
      },
    ],
    3: [
      {
        prompt: "Why must false gospels be confronted directly?",
        options: [
          "Because distorted messages can use Christian words while leading people away from the true Christ.",
          "Because every message with spiritual themes is basically safe.",
          "Because doctrine should never be examined publicly.",
          "Because sincerity guarantees truth.",
        ],
        answerIndex: 0,
        explanation:
          "The session warns that dangerous distortions often sound familiar on the surface while corrupting the gospel itself.",
      },
      {
        prompt: "Which distortion is specifically at odds with the true gospel in this lecture?",
        options: [
          "A prosperity message that treats Christ mainly as the means to health, success, or financial breakthrough.",
          "A call to trust Christ crucified and risen.",
          "Teaching repentance and faith together.",
          "Preaching God's holiness and human sin.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats prosperity teaching as a serious distortion because it recenters the message on earthly gain.",
      },
      {
        prompt: "What is one pastoral danger of false assurance highlighted here?",
        options: [
          "People may feel secure while never having truly come to Christ in repentance and faith.",
          "It makes Christians study Scripture too much.",
          "It guarantees long-term spiritual maturity.",
          "It removes the need for church discipline entirely.",
        ],
        answerIndex: 0,
        explanation:
          "The session is concerned not only with bad doctrine but with souls comforted by a counterfeit gospel.",
      },
    ],
    4: [
      {
        prompt: "How does this session frame evangelism in the Philippine context?",
        options: [
          "As faithful, culturally aware proclamation that keeps the gospel clear while addressing local assumptions and distortions.",
          "As copying foreign methods without discernment.",
          "As avoiding difficult truths for the sake of acceptance.",
          "As a task only for formal preachers.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture joins contextual awareness with doctrinal clarity rather than treating them as opposites.",
      },
      {
        prompt: "Why is contextual sensitivity necessary in evangelism according to this lecture?",
        options: [
          "Because people hear the gospel through existing religious habits, cultural assumptions, and local pressures that must be addressed wisely.",
          "Because culture can rewrite the gospel message itself.",
          "Because biblical truth should be minimized in difficult settings.",
          "Because methods matter more than the message.",
        ],
        answerIndex: 0,
        explanation:
          "The session treats context as something to understand pastorally, not something allowed to rule the message.",
      },
      {
        prompt: "What remains non-negotiable in evangelism here?",
        options: [
          "The call to proclaim Christ clearly and summon hearers to repentance and faith.",
          "Avoiding mention of sin or judgment.",
          "Promising visible success if the method is right.",
          "Treating all beliefs as equally valid paths to God.",
        ],
        answerIndex: 0,
        explanation:
          "The course closes by insisting that contextual wisdom must never dilute the actual gospel demand and promise.",
      },
    ],
  },
  "course-9": {
    1: [
      {
        prompt: "How does this session define apologetics most basically?",
        options: [
          "A biblical defense and commendation of the Christian faith that aims at truth, persuasion, and faithful witness.",
          "Winning arguments for their own sake.",
          "Replacing preaching with philosophy.",
          "Avoiding difficult objections by staying abstract.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture presents apologetics as a form of Christian witness ordered toward truth and love, not mere debate culture.",
      },
      {
        prompt: "Why does apologetics matter according to this session?",
        options: [
          "Because believers must be ready to answer objections, strengthen confidence in the truth, and remove unnecessary stumbling blocks.",
          "Because only scholars are called to defend the faith.",
          "Because the gospel becomes secondary once arguments are strong enough.",
          "Because apologetics can produce conversion without the Spirit.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats apologetics as supportive of evangelism and discipleship, not as a substitute for grace.",
      },
      {
        prompt: "What posture should mark Christian apologetics here?",
        options: [
          "Courage joined with gentleness, clarity, patience, and submission to Scripture.",
          "Sarcasm and humiliation of opponents.",
          "Neutrality about truth claims.",
          "A purely academic tone detached from pastoral concern.",
        ],
        answerIndex: 0,
        explanation:
          "The session emphasizes both conviction and Christlike manner in defending the faith.",
      },
    ],
    2: [
      {
        prompt: "What challenge is highlighted in the discussion of the modern self?",
        options: [
          "A culture that treats inward feeling and self-definition as ultimate authority over created reality.",
          "A renewed commitment to biblical anthropology.",
          "A social order with no confusion about identity.",
          "An environment where truth claims are universally welcomed.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture frames modern identity conflicts as rooted in expressive individualism and the sovereignty of the self.",
      },
      {
        prompt: "How should Christians respond to identity and gender confusion in this session?",
        options: [
          "With truth and compassion, grounding personhood in creation, fall, and redemption rather than self-invention.",
          "With silence because the issues are too controversial.",
          "By affirming every self-claim as equally true.",
          "By reducing the discussion to political slogans.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture insists that biblical clarity and neighbor-love must stay together in this area.",
      },
      {
        prompt: "What is one apologetic task emphasized here?",
        options: [
          "Exposing the weaknesses of expressive individualism while showing the goodness of God's design for humanity.",
          "Avoiding the doctrine of creation entirely.",
          "Treating embodiment as irrelevant to discipleship.",
          "Framing Christianity as merely one lifestyle preference among many.",
        ],
        answerIndex: 0,
        explanation:
          "The session moves from critique to positive witness about creation, identity, and redemption in Christ.",
      },
    ],
    3: [
      {
        prompt: "Why does this session address social justice and critical theory carefully?",
        options: [
          "Because Christians should care about real injustice while testing every framework by Scripture and the gospel.",
          "Because justice concerns are always unbiblical.",
          "Because secular theories should be adopted without discernment.",
          "Because the gospel has nothing to say about public ethics.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture refuses both indifference to injustice and uncritical borrowing from competing worldviews.",
      },
      {
        prompt: "What is one concern raised about critical theory in this session?",
        options: [
          "It can recast sin, guilt, and righteousness in categories that rival or distort the gospel.",
          "It always encourages careful exegesis.",
          "It is identical to the biblical doctrine of justice.",
          "It removes all moral confusion from public life.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture examines how alternative frameworks can displace biblical categories if left untested.",
      },
      {
        prompt: "What remains central when discussing justice here?",
        options: [
          "The gospel of reconciliation with God through Christ, which also shapes love of neighbor and true justice.",
          "Political strategy as the church's primary mission.",
          "Class struggle as the final explanation of evil.",
          "A refusal to discuss sin and salvation.",
        ],
        answerIndex: 0,
        explanation:
          "The session keeps the church's witness anchored in Christ's saving work while still addressing moral and social questions.",
      },
    ],
    4: [
      {
        prompt: "How does this session frame apologetic engagement with Filipino culture?",
        options: [
          "As patient, context-aware gospel witness that understands local values and idols without compromising biblical truth.",
          "As importing foreign arguments without listening to local realities.",
          "As affirming every cultural pattern uncritically.",
          "As treating culture as irrelevant to communication.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture emphasizes real cultural understanding as part of faithful gospel communication.",
      },
      {
        prompt: "Why is cultural awareness important in apologetics according to this lecture?",
        options: [
          "Because people interpret truth claims through inherited loyalties, habits, fears, and hopes that apologetics must address wisely.",
          "Because culture determines truth.",
          "Because doctrine should be hidden behind vague spirituality.",
          "Because biblical categories do not travel across contexts.",
        ],
        answerIndex: 0,
        explanation:
          "The session treats culture as the setting of witness, not as the authority over the message.",
      },
      {
        prompt: "What remains non-negotiable in cultural engagement here?",
        options: [
          "The clear proclamation of Christ and the call to repentance and faith.",
          "Avoiding offense by never naming error.",
          "Letting local expectations redefine the gospel.",
          "Replacing Scripture with storytelling alone.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture closes by keeping contextual sensitivity under the authority of the gospel itself.",
      },
    ],
  },
  "course-10": {
    1: [
      {
        prompt: "How does this session frame work most fundamentally?",
        options: [
          "As part of humanity's created calling before God, not merely a way to earn money or status.",
          "As a curse with no positive place in God's design.",
          "As spiritually neutral unless done inside church ministry.",
          "As valuable only when it leads to personal advancement.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats work as rooted in creation and ordered toward stewardship, service, and worship before God.",
      },
      {
        prompt: "Why does the session reject the sacred-versus-secular split?",
        options: [
          "Because all lawful work can be offered to God in faithful service, not just explicitly religious roles.",
          "Because worship belongs only to private devotion.",
          "Because vocation matters only for clergy.",
          "Because ordinary labor has no theological significance.",
        ],
        answerIndex: 0,
        explanation:
          "The session emphasizes that Christ's Lordship reaches ordinary labor, business, study, and service.",
      },
      {
        prompt: "What distortion of work is challenged here?",
        options: [
          "Treating work as an idol of identity and worth rather than a gift and stewardship under God.",
          "Seeing work as one arena for loving neighbor.",
          "Receiving work as part of God's common grace.",
          "Connecting labor with obedience to God's design.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture warns against both laziness and work-idolatry by re-centering labor under worship.",
      },
    ],
    2: [
      {
        prompt: "What is vocation according to this session?",
        options: [
          "A God-governed sense of calling that includes faithful stewardship of one's station, gifts, and responsibilities.",
          "A mystical inner feeling detached from ordinary duties.",
          "A label reserved only for church office.",
          "A guarantee of ideal career satisfaction.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture presents vocation as broader than job title, including family, church, and neighbor-serving responsibilities.",
      },
      {
        prompt: "How should Christians think about calling and career decisions here?",
        options: [
          "By weighing Scripture, wisdom, gifts, providence, and opportunities rather than chasing prestige alone.",
          "By choosing the most impressive option regardless of character.",
          "By waiting for certainty before taking any step.",
          "By treating income as the only serious factor.",
        ],
        answerIndex: 0,
        explanation:
          "The session encourages wise, prayerful judgment rather than romantic or purely status-driven notions of calling.",
      },
      {
        prompt: "What is one danger in modern talk about calling?",
        options: [
          "Confusing self-fulfillment with vocation instead of asking how one may serve God and neighbor faithfully.",
          "Taking ordinary responsibilities seriously.",
          "Receiving work as stewardship.",
          "Seeking counsel in major decisions.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture resists turning calling into a search for personal significance detached from obedience and service.",
      },
    ],
    3: [
      {
        prompt: "How is productivity treated in this session?",
        options: [
          "As stewardship of time, attention, and energy under God's priorities, not as frantic efficiency for its own sake.",
          "As the highest measure of a person's worth.",
          "As a secular topic unrelated to discipleship.",
          "As a way to eliminate creaturely limits entirely.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture reframes productivity morally and spiritually, emphasizing faithfulness over endless output.",
      },
      {
        prompt: "What principle about time is emphasized here?",
        options: [
          "Time is a gift from God to be redeemed wisely, with priorities shaped by calling, love, and finitude.",
          "Time belongs mainly to personal ambition.",
          "Rest is a sign of weakness rather than obedience.",
          "Stewardship means maximizing every moment without pause.",
        ],
        answerIndex: 0,
        explanation:
          "The session ties planning and diligence to creatureliness, rest, and responsibility before God.",
      },
      {
        prompt: "What is one productivity danger warned against in this lecture?",
        options: [
          "Busyness that looks disciplined but actually displaces prayer, worship, relationships, and wise rest.",
          "Taking sabbath patterns seriously.",
          "Planning work with realistic limits.",
          "Recognizing human finitude.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture critiques hurried self-management when it crowds out what God actually commands and values.",
      },
    ],
    4: [
      {
        prompt: "How does this session frame technology and social media?",
        options: [
          "As tools that must be governed by wisdom, self-control, and love rather than by impulse or cultural pressure.",
          "As automatically evil and unusable for Christians.",
          "As morally neutral in every use and effect.",
          "As the main source of identity and community.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture avoids simplistic answers by treating technology as powerful and formative, requiring discernment.",
      },
      {
        prompt: "What is one spiritual risk of social media emphasized here?",
        options: [
          "It can intensify comparison, vanity, distraction, outrage, and disordered attention if left unchecked.",
          "It always deepens prayer and wisdom automatically.",
          "It removes the need for embodied fellowship.",
          "It guarantees truthful communication.",
        ],
        answerIndex: 0,
        explanation:
          "The session focuses on how digital habits can train the heart toward restlessness and self-display.",
      },
      {
        prompt: "What kind of response does the lecture encourage?",
        options: [
          "Intentional, disciplined use shaped by truth, purity, neighbor-love, and embodied Christian life.",
          "Passive conformity to whatever the feed rewards.",
          "Total dependence on online affirmation.",
          "Treating digital habits as exempt from discipleship.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture closes by bringing devices, platforms, and habits under the ordinary demands of Christian holiness.",
      },
    ],
  },
  "course-11": {
    1: [
      {
        prompt: "How does this session define true worship most basically?",
        options: [
          "As God-centered response governed by His Word rather than human preference or religious excitement alone.",
          "As any sincere expression that feels spiritual to the worshiper.",
          "As music alone rather than the whole gathered service.",
          "As a private experience disconnected from the church.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture frames worship as regulated by God's self-revelation and directed toward His glory, not merely personal taste.",
      },
      {
        prompt: "What danger in worship is especially challenged in this session?",
        options: [
          "Treating worship as consumer experience instead of reverent covenant meeting with God.",
          "Reading Scripture publicly in church.",
          "Joining worship with prayer and praise.",
          "Taking worship seriously as holy service.",
        ],
        answerIndex: 0,
        explanation:
          "The session resists entertainment-driven assumptions by restoring the gravity and God-centeredness of gathered worship.",
      },
      {
        prompt: "Why must worship be shaped by Scripture according to the lecture?",
        options: [
          "Because God determines how He is to be approached, and faithful worship answers His revelation.",
          "Because church tradition makes the Bible unnecessary.",
          "Because worship depends mainly on cultural trends.",
          "Because sincerity is enough even without truth.",
        ],
        answerIndex: 0,
        explanation:
          "The session grounds worship in divine authority: God speaks first, and the church responds on His terms.",
      },
    ],
    2: [
      {
        prompt: "What is the church in this session's framework?",
        options: [
          "The gathered people of God in Christ, not merely a building or voluntary social association.",
          "A religious venue defined mostly by architecture.",
          "A private spirituality network without visible structure.",
          "A cultural institution detached from the gospel.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture emphasizes the church as Christ's people, visibly assembled around Word, sacrament, and discipline.",
      },
      {
        prompt: "Which classic marks of the true church are emphasized here?",
        options: [
          "Faithful preaching of the Word, right administration of the sacraments, and meaningful church discipline.",
          "Large attendance, political influence, and strong branding.",
          "Ancient buildings, wealth, and social prestige.",
          "Emotional intensity, novelty, and celebrity leadership.",
        ],
        answerIndex: 0,
        explanation:
          "The session uses the Reformation marks to identify the church's health and faithfulness.",
      },
      {
        prompt: "Why does the lecture insist on a visible church rather than isolated Christianity?",
        options: [
          "Because Christ saves believers into a covenant body that is meant to gather, submit, and serve together.",
          "Because private devotion is always worthless.",
          "Because institutional life automatically guarantees holiness.",
          "Because the church exists mainly for social convenience.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture rejects lone-Christian instincts by stressing membership, accountability, and shared means of grace.",
      },
    ],
    3: [
      {
        prompt: "How are baptism and the Lord's Supper treated in this session?",
        options: [
          "As Christ-instituted signs and seals of the covenant, not empty rituals and not magical acts.",
          "As optional church customs with no doctrinal importance.",
          "As merely symbolic traditions invented later by the church.",
          "As automatic guarantees of salvation apart from faith.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture holds together sacramental significance and the need for faith, avoiding both reductionism and superstition.",
      },
      {
        prompt: "What is one major error the session avoids when discussing the sacraments?",
        options: [
          "Separating the visible sign from Christ's promise on one side, or making the rite work mechanically on the other.",
          "Teaching that Christ gave ordinances to the church.",
          "Connecting the Supper with remembrance and communion.",
          "Taking baptism seriously in the church's life.",
        ],
        answerIndex: 0,
        explanation:
          "The session avoids both bare memorialism and sacramental automatism by placing the signs within covenant theology.",
      },
      {
        prompt: "Why does the Lord's Supper matter for the church's life according to this lecture?",
        options: [
          "It nourishes faith, proclaims Christ's death, and visibly binds the body together under the gospel.",
          "It replaces the need for preaching.",
          "It is mainly a personal mystical exercise detached from the church.",
          "It exists only to preserve tradition without spiritual use.",
        ],
        answerIndex: 0,
        explanation:
          "The session presents the Supper as a communal means of grace centered on Christ and His finished work.",
      },
    ],
    4: [
      {
        prompt: "What role do creeds and confessions serve in this session?",
        options: [
          "They summarize biblical teaching, guard doctrinal identity, and help the church confess the faith together.",
          "They replace Scripture as a higher authority.",
          "They are useful only for historians, not ordinary church life.",
          "They exist mainly to encourage denominational rivalry.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats confessional standards as subordinate but important tools for clarity, continuity, and corporate witness.",
      },
      {
        prompt: "Why is corporate doctrinal identity presented as important?",
        options: [
          "Because the church must know what it believes and publicly confess the truth in a coherent, shared way.",
          "Because vague belief is safer than precise doctrine.",
          "Because unity requires avoiding all theological boundaries.",
          "Because confessions matter only for clergy examinations.",
        ],
        answerIndex: 0,
        explanation:
          "The session argues that shared confession protects unity in truth rather than undermining it.",
      },
      {
        prompt: "How should Scripture and confessions relate according to the lecture?",
        options: [
          "Scripture remains the supreme authority, while confessions serve ministerially and must be tested by the Word.",
          "Confessions overrule Scripture when disputes arise.",
          "They are equal authorities in the same sense.",
          "Confessions should be ignored because all summaries distort doctrine.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture preserves sola Scriptura while defending the church's need for faithful doctrinal summaries.",
      },
    ],
  },
};

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function normalize(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€˜/g, "‘")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .replace(/Â·/g, "·")
    .replace(/ðŸ“–/g, "📖")
    .replace(/ðŸ“š/g, "📚")
    .replace(/ðŸ”¬/g, "🔬")
    .replace(/ðŸ“Ž/g, "📎")
    .replace(/â€¦/g, "…");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

function inlineMarkdown(value = "") {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function splitBlocks(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => block !== "---");
}

function tableHtml(block) {
  const rows = block
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()));
  const filtered = rows.filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
  if (filtered.length < 2) return "";
  const [head, ...body] = filtered;
  return `<div class="detail-table-wrap"><table class="detail-table"><thead><tr>${head
    .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function listHtml(lines) {
  const ordered = lines.every((line) => /^\d+\.\s+/.test(line));
  const tag = ordered ? "ol" : "ul";
  const items = lines.map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
  return `<${tag}>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${tag}>`;
}

function markdownToHtml(markdown) {
  const html = [];
  for (const block of splitBlocks(markdown)) {
    const lines = block.split("\n");
    if (/^#{1,6}\s+/.test(block)) {
      const heading = block.replace(/^#{1,6}\s+/, "");
      const level = Math.min(4, Math.max(3, block.match(/^#+/)[0].length));
      html.push(`<h${level}>${inlineMarkdown(heading)}</h${level}>`);
    } else if (lines.every((line) => line.trim().startsWith(">"))) {
      const quote = lines.map((line) => line.replace(/^>\s?/, "")).join("\n");
      html.push(`<blockquote class="detail-quote">${markdownToHtml(quote)}</blockquote>`);
    } else if (lines.every((line) => /^([-*]|\d+\.)\s+/.test(line.trim()))) {
      html.push(listHtml(lines.map((line) => line.trim())));
    } else if (lines.filter((line) => line.trim().startsWith("|")).length >= 2) {
      html.push(tableHtml(block));
    } else {
      html.push(`<p>${inlineMarkdown(block).replace(/\n/g, "<br />")}</p>`);
    }
  }
  return html.join("\n");
}

function textBetween(markdown, startPattern, endPattern) {
  const start = markdown.search(startPattern);
  if (start === -1) return "";
  const sliced = markdown.slice(start).replace(startPattern, "");
  const end = sliced.search(endPattern);
  return (end === -1 ? sliced : sliced.slice(0, end)).trim().replace(/^---\s*/m, "").trim();
}

function cleanSectionTitle(value) {
  return value.replace(/^#+\s*/, "").replace(/[📖📚🔬📎]/g, "").trim();
}

function bullets(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim());
}

function parseOverview(coursePath) {
  const markdown = normalize(readUtf8(path.join(coursePath, "00_Course_Overview.md")));
  const titleLine = markdown.match(/^#\s+(.+)$/m)?.[1] || "";
  const description = textBetween(markdown, /## Course Description\s*/, /\n---\n|## Learning Objectives/)
    .replace(/\n+/g, " ")
    .replace(/\*\*/g, "")
    .trim();
  const objectives = bullets(textBetween(markdown, /## Learning Objectives\s*/, /\n---\n|## Sessions/));
  const sourcesSection = textBetween(markdown, /## Crossway Library Sources for This Course\s*/, /\n---\n|## Personal Library|## How to Use/);
  const personalLibrary = bullets(textBetween(markdown, /## Personal Library[^]*?Assigned Readings\s*/, /\n---\n|## /));
  const sources = sourcesSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || (line.startsWith("|") && !/^\|\s*[-:]+\s*\|/.test(line)))
    .map((line) => {
      if (line.startsWith("-")) return line.replace(/^-\s+/, "");
      const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
      if (cells[0] === "Ebook") return "";
      return cells[0] && cells[1] ? `${cells[0]} — ${cells[1]}` : cells[0];
    })
    .filter(Boolean)
    .map((line) => line.replace(/\*\*/g, "").replace(/\*/g, ""));
  return {
    titleLine,
    description,
    objectives: objectives.map((line) => line.replace(/\*\*/g, "")),
    crosswaySources: sources,
    personalLibrary: personalLibrary.map((line) => line.replace(/\*/g, "")),
  };
}

function headingSections(markdown) {
  const matches = [...markdown.matchAll(/^###\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return {
      heading: cleanSectionTitle(match[1]),
      body: markdown.slice(start, end).trim().replace(/^---\s*/m, "").trim(),
    };
  });
}

function firstHeading(markdown) {
  return markdown.match(/^#\s+(.+)$/m)?.[1] || "";
}

function parseKeyVerse(markdown) {
  return markdown.match(/Key Verse:\s*([^*]+)\*/)?.[1]?.trim() || "";
}

function parseLectureSources(markdown) {
  return markdown.match(/Lecture sources \(Crossway library\):\*\*\s*([^\n]+)/)?.[1]?.trim() || "";
}

function sectionAfter(markdown, pattern, endPattern = /\n---\n## /) {
  return textBetween(markdown, pattern, endPattern);
}

function extractReflectionPrompts(markdown) {
  const prompts = [];
  const reflectionMatches = [...markdown.matchAll(/(?:\*\*)?Reflection(?: prompt)?:(?:\*\*)?\s*([^\n]+)/gi)];
  for (const match of reflectionMatches) prompts.push(match[1].trim());
  return [...new Set(prompts.map((line) => line.replace(/^[-*]\s+/, "").replace(/\*\*/g, "")))];
}

function extractResearchTasks(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").trim());
}

function extractMemory(section) {
  return section.match(/\*\*Memory verse:\*\*\s*([^\n]+)/i)?.[1]?.trim() || "";
}

function extractReadingAssignments(section) {
  const assigned = textBetween(section, /\*\*Assigned for this session:\*\*\s*/, /\n\n|\*\*Reflection prompt|\*\*Memory verse/);
  return bullets(assigned).map((line) => line.replace(/\*/g, ""));
}

function parseCourseGlossaries() {
  const markdown = normalize(readUtf8(glossaryFile));
  const matches = [...markdown.matchAll(/^## Course (\d+)[^\n]*\n(?:### [^\n]+\n)?\n((?:\|[^\n]*\n)+)/gm)];
  return Object.fromEntries(
    matches.map((match) => {
      const courseNumber = Number(match[1]);
      const terms = match[2]
        .split("\n")
        .filter((line) => line.trim().startsWith("|"))
        .slice(2)
        .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()))
        .filter((cells) => cells.length >= 2)
        .map(([term, definition]) => ({
          term: term.replace(/\*\*/g, ""),
          definition: definition.replace(/\*\*/g, ""),
        }));
      return [courseNumber, terms];
    })
  );
}

const glossaryTermsByCourse = parseCourseGlossaries();

function extractAppendixTerms(markdown) {
  const glossary = sectionAfter(markdown, /##\s+📎?\s*Key Terms[^\n]*\s*/, /$/);
  if (!glossary) return [];
  return glossary
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .slice(2)
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2)
    .map(([term, definition]) => ({
      term: term.replace(/\*\*/g, ""),
      definition: definition.replace(/\*\*/g, ""),
    }));
}

function parseSession(courseId, filePath, number) {
  const markdown = normalize(readUtf8(filePath));
  const lectureContent = sectionAfter(markdown, /##\s+📖?\s*LECTURE[^\n]*\s*/, /\n---\n\n##\s+📖?\s*SCRIPTURE READING/);
  const scriptureSection = sectionAfter(markdown, /##\s+📖?\s*SCRIPTURE READING\s*/, /\n---\n\n##\s+📚?\s*EXTRA READING/);
  const readingSection = sectionAfter(markdown, /##\s+📚?\s*EXTRA READING[^\n]*\s*/, /\n---\n\n##\s+🔬?\s*LAB/);
  const labSection = sectionAfter(markdown, /##\s+🔬?\s*LAB[^\n]*\s*/, /\n---\n\n##\s+📎?\s*Key Terms|$/);
  const lectureSections = headingSections(lectureContent).map((section) => ({
    heading: section.heading,
    html: markdownToHtml(section.body),
    plainText: section.body.replace(/\*\*/g, "").replace(/\*/g, ""),
  }));
  const reflectionPrompts = extractReflectionPrompts(`${scriptureSection}\n${readingSection}`);
  const researchTasks = extractResearchTasks(labSection);
  const readingAssignments = extractReadingAssignments(readingSection);
  const memory = extractMemory(readingSection);
  const title = firstHeading(markdown).replace(/^Session\s+\d+:\s*/, "").trim();
  const appendixTerms = extractAppendixTerms(markdown);
  const lecturePreview = lectureSections.map((section) => section.heading);
  const reflection = [
    ...readingAssignments.map((item) => `Read: ${item}`),
    ...reflectionPrompts.map((item) => `Reflect: ${item}`),
    ...(memory ? [`Memorize: ${memory}`] : []),
  ];
  return {
    number,
    title,
    keyVerse: parseKeyVerse(markdown),
    lectureSources: parseLectureSources(markdown),
    lectureSections,
    lectureHtml: lectureSections
      .map((section) => `<section class="lecture-section"><h3>${inlineMarkdown(section.heading)}</h3>${section.html}</section>`)
      .join(""),
    reflectionHtml: markdownToHtml(`${scriptureSection}\n\n${readingSection}`),
    labHtml: markdownToHtml(labSection),
    appendixTerms,
    fullText: markdown.replace(/[#*_>`|–—-]/g, " ").replace(/\s+/g, " ").trim(),
    lecturePreview,
    lecture: lecturePreview,
    reflection,
    lab: researchTasks,
    reflectionPrompts,
    researchTasks,
    quiz: quizzes[courseId]?.[number] || [],
  };
}

function buildCourse(config) {
  const coursePath = path.join(lectureRoot, config.directory);
  const overview = parseOverview(coursePath);
  const sessions = config.files.map((file, index) => parseSession(config.id, path.join(coursePath, file), index + 1));
  const glossaryTerms = glossaryTermsByCourse[config.number] || [];
  if (glossaryTerms.length && sessions.length) {
    sessions[sessions.length - 1].appendixTerms = glossaryTerms;
  }
  return {
    id: config.id,
    number: config.number,
    description: overview.description,
    objectives: overview.objectives,
    crosswaySources: overview.crosswaySources,
    personalLibrary: overview.personalLibrary,
    sessions,
  };
}

const courses = courseConfigs.map(buildCourse);
const output = `// Generated by scripts/build-lectures.js from local markdown lecture files.\n(function () {\n  const lectureCourses = ${JSON.stringify(courses, null, 2)};\n  const glossaryTermsByCourse = ${JSON.stringify(glossaryTermsByCourse, null, 2)};\n  const data = window.SHEPHERD_CURRICULUM;\n  if (!data || !Array.isArray(data.courses)) return;\n\n  lectureCourses.forEach((lectureCourse) => {\n    const course = data.courses.find((item) => item.id === lectureCourse.id || item.number === lectureCourse.number);\n    if (!course) return;\n    course.description = lectureCourse.description || course.description;\n    course.objectives = lectureCourse.objectives?.length ? lectureCourse.objectives : course.objectives;\n    course.crosswaySources = lectureCourse.crosswaySources || [];\n    course.personalLibrary = lectureCourse.personalLibrary || [];\n    if (lectureCourse.number === 2) {\n      course.title = \"The Trinity - One God, Three Persons\";\n      course.category = \"The Trinity\";\n    }\n    course.sessions.forEach((session) => {\n      const detail = lectureCourse.sessions.find((item) => item.number === session.number);\n      if (!detail) return;\n      Object.assign(session, detail);\n    });\n  });\n\n  data.courses.forEach((course) => {\n    const glossaryTerms = glossaryTermsByCourse[course.number] || [];\n    if (!glossaryTerms.length) return;\n    const glossarySession = course.sessions.find((session) => session.number === 4) || course.sessions[course.sessions.length - 1];\n    if (glossarySession) glossarySession.appendixTerms = glossaryTerms;\n  });\n})();\n`;

fs.writeFileSync(path.join(workspace, "course-lectures.js"), output, "utf8");
console.log(`Generated ${path.join(workspace, "course-lectures.js")}`);
