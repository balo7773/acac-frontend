export type TeamMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
};

export const CAMPUS_LEADS: TeamMember[] = [
  {
    name: "David Horsfall",
    role: "Campus Lead",
    image: "/team/campus_lead.jpg",
    bio: "", // Leave empty for now, you will write this
    linkedin: "https://www.linkedin.com/in/david-horsfall-a98626372/",
  },
  {
    name: "Mubashir Najmudeen",
    role: "Campus Co-Lead",
    image: "/team/co_campus_lead.jpg",
    bio: "", 
    linkedin: "https://www.linkedin.com/in/mubashir-najmudeen/",
  },
];

// Alphabetical by first name
export const UNIT_LEADS: TeamMember[] = [
  {
    name: "Abdullahi Abdul Mumeen",
    role: "Academic Unit Lead",
    image: "/team/academic_unit_lead_1.png",
    bio: "",
    linkedin: "https://www.linkedin.com/in/abdullahi-olalekan-abdulmumeen/",
  },
  {
    name: "Adetomiwa Stephen",
    role: "Media Unit Lead",
    image: "/team/media_unit.png",
    bio: "",
    linkedin: "https://www.linkedin.com/in/stephenoyedare/",
  },
  {
    name: "Aisha A. Kosoko",
    role: "Public Speaking & Moderation Unit Lead",
    image: "/team/public_speaking_and_moderation_unit_lead.jpg",
    bio: "",
    linkedin: "https://www.linkedin.com/in/aishaadedamolakosoko/",
  },
  {
    name: "Awesome Nwokolo",
    role: "Financial Literacy Unit Lead",
    image: "/team/financial_literacy_lead.jpg",
    bio: "",
    linkedin: "https://www.linkedin.com/in/awesome-nwokolo-460476348/",
  },
  {
    name: "Balogun Abdulmalik",
    role: "Interim Campus Lead",
    image: "/team/host_interim_campus_lead.jpg",
    bio: "",
    linkedin: "https://www.linkedin.com/in/balo7773",
  },
  {
    name: "Favour Oloruntoba",
    role: "Community Manager",
    image: "/team/community_manager.png",
    bio: "",
    linkedin: "https://www.linkedin.com/in/favour-oloruntoba-224bab376/",
  },
  {
    name: "Fawziya Yakubu",
    role: "Welfare Unit Lead",
    image: "/team/welfare_unit_lead.png",
    bio: "",
    linkedin: "https://www.linkedin.com/in/fawziya-yakubu-amodu/",
  },
  {
    name: "Imran Salami",
    role: "Academic Unit Lead",
    image: "/team/academic_unit_lead.jpg",
    bio: "",
    linkedin: "https://www.linkedin.com/in/imran-salami-2899b3440/",
  },
  {
    name: "Ndukwe Promise",
    role: "Programs & Operations Lead",
    image: "/team/program_operation_lead.png",
    bio: "",
    linkedin: "https://www.linkedin.com/in/ndukwepromise/",
  },
  {
    name: "Oyelade Oyetade-ola",
    role: "Event Planning Lead",
    image: "", // No image provided yet
    bio: "",
    linkedin: "", // No LinkedIn provided yet
  },
  {
    name: "Shalom Asuelimen",
    role: "Career Development Unit Lead",
    image: "", // No image provided yet
    bio: "",
    linkedin: "", // No LinkedIn provided yet
  },
];
