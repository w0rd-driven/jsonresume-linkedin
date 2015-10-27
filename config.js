module.exports = {
  api_url: "https://api.linkedin.com/v1/",
  api_format: 'json',
  api_fields: [
    'id', 'formatted-name', 'headline', 'picture-url', 'email-address', 'phone-numbers', 'summary', 'main-address',
    'public-profile-url', 'primary-twitter-account', 'positions', 'projects', 'volunteer', 'educations', 'certifications',
    'honors-awards', 'publications', 'skills', 'languages', 'interests', 'recommendations-received'
  ],
  skill_categories: [
    {
      category: "Concepts",
      skills: ["FP", "OOP", "BDD", "TDD", "CI", "DI", "Mocks", "REST", "ORM"]
    },
    {
      category: "Web Development",
      level: "Intermediate",
      skills: ["HTML", "Javascript", "CSS", "jQuery", "Bootstrap", "Bower", "Gulp", "Node", "ASP.NET MVC", "WCF", "IIS", "Apache", "MySQL", "PHP", "Slim Framework", "Laravel", "XML"]
    },
    {
      category: "Application Development",
      level: "Intermediate",
      skills: ["XAML", "WPF", "Silverlight", "LINQ", "Entity Framework", "Windows Services"]
    },
    {
      category: "Operating Systems",
      level: "Master",
      skills: ["Microsoft Windows 7+", "OSX Yosemite+", "CentOS 6.5", "Windows 10 Mobile", "iOS"]
    },
    {
      category: "Software",
      skills: ["JetBrains WebStorm", "JetBrains PHPStorm", "Microsoft Visual Studio", "Microsoft Expression Blend", "Git", "Mercurial", "Subversion", "Vagrant", "Virtual Box", "Adobe Photoshop", "Gitflow", "JIRA"]
    },
    {
      category: "Programming",
      level: "Intermediate",
      skills: ["C#", "JavaScript", "PHP", "SQL"]
    }
  ],
  data: {

  }
};
