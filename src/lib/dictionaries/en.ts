import type { Dictionary } from "./fa";

const en: Dictionary = {
  meta: {
    title: "Artosphere | Branding Studio by Kourosh Arezoomand",
    description:
      "An atmosphere where ideas become visual experiences. Branding and graphic design studio by Kourosh Arezoomand."
  },
  nav: {
    home: "Home",
    work: "Work",
    services: "Services",
    about: "About",
    process: "Process",
    contact: "Contact"
  },
  hero: {
    eyebrow: "Branding Studio",
    headline: "An atmosphere where ideas become visual experiences",
    sub: "Artosphere is the personal studio of Kourosh Arezoomand, where brands find identity, voice, and a lasting image.",
    cta: "View work",
    ctaSecondary: "Start a project"
  },
  intro: {
    label: "Who I am",
    body: "I'm Kourosh Arezoomand, a graphic designer, art director, and multimedia student. Artosphere is my personal brand and creative studio, where I design branding, visual identity, and creative direction for businesses that want to be seen."
  },
  services: {
    label: "Services",
    heading: "What I do",
    items: [
      { title: "Branding & Brand Identity", desc: "Full visual identity, from strategy to execution." },
      { title: "Logo Design", desc: "Marks that are simple, precise, and built to last." },
      { title: "Packaging Design", desc: "Packaging that brings a brand to life on the shelf." },
      { title: "Motion Design", desc: "Bringing visual identity to motion for digital spaces." },
      { title: "Social Media Design", desc: "A consistent visual language for everyday brand presence." },
      { title: "Creative Direction", desc: "Guidance on every visual decision, from idea to final execution." }
    ]
  },
  work: {
    label: "Work",
    heading: "Selected projects",
    viewProject: "View project",
    empty: "New projects are coming soon."
  },
  about: {
    label: "About",
    heading: "Kourosh Arezoomand",
    body: "I'm a graphic designer and art director. Alongside studying multimedia, I work on visual branding for small and large brands. Artosphere is the platform for that work, where ideas take shape, color, and voice.",
    toolsLabel: "Tools",
    tools: ["Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects", "Adobe Premiere Pro"]
  },
  process: {
    label: "Process",
    heading: "How I work",
    steps: [
      { title: "Discover", desc: "Understanding the brand, audience, and goal through research and conversation." },
      { title: "Concept", desc: "Shaping visual directions and choosing the core path." },
      { title: "Design", desc: "Executing the identity across every brand touchpoint." },
      { title: "Deliver", desc: "Preparing files and brand guidelines ready for use." }
    ]
  },
  contact: {
    label: "Contact",
    heading: "Start a project",
    sub: "Send a message to work together; I'll get back to you shortly.",
    form: {
      name: "Name",
      email: "Email",
      budget: "Approximate budget (optional)",
      message: "Tell me about your project",
      submit: "Send message",
      sending: "Sending…",
      success: "Your message has been sent. I'll reply soon.",
      error: "Something went wrong. Please try again."
    }
  },
  footer: {
    tagline: "An atmosphere where ideas become visual experiences.",
    rights: "All rights reserved."
  }
};

export default en;
