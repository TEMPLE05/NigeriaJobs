const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

const sampleJobs = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp Nigeria",
    location: "Lagos, Nigeria",
    description: "We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks.",
    salary: "₦500,000 - ₦800,000",
    jobType: "Full-time",
    category: "Technology",
    applicationUrl: "https://techcorp.com/careers/frontend-dev",
    source: "Jobberman",
    datePosted: new Date(),
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Product Manager",
    company: "FinTech Solutions",
    location: "Abuja, Nigeria",
    description: "Lead product development initiatives and work closely with engineering teams to deliver innovative financial technology solutions.",
    salary: "₦700,000 - ₦1,000,000",
    jobType: "Full-time",
    category: "Finance",
    applicationUrl: "https://fintech.ng/careers/pm",
    source: "MyJobMag",
    datePosted: new Date(Date.now() - 86400000), // 1 day ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "UX/UI Designer",
    company: "Creative Agency Ltd",
    location: "Port Harcourt, Nigeria",
    description: "Create beautiful and intuitive user experiences for web and mobile applications. Work with cross-functional teams to deliver pixel-perfect designs.",
    salary: "₦400,000 - ₦600,000",
    jobType: "Full-time",
    category: "Design",
    applicationUrl: "https://creativeagency.com/designer",
    source: "Hot Nigerian Jobs",
    datePosted: new Date(Date.now() - 172800000), // 2 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Data Analyst",
    company: "Analytics Pro",
    location: "Lagos, Nigeria",
    description: "Analyze large datasets to provide actionable business insights. Experience with SQL, Python, and data visualization tools required.",
    salary: "₦450,000 - ₦650,000",
    jobType: "Full-time",
    category: "Technology",
    applicationUrl: "https://analyticspro.com/data-analyst",
    source: "Jobberman",
    datePosted: new Date(Date.now() - 259200000), // 3 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Marketing Specialist",
    company: "BrandBoost Agency",
    location: "Kano, Nigeria",
    description: "Develop and execute marketing campaigns across digital channels. Experience with social media marketing and content creation preferred.",
    salary: "₦350,000 - ₦500,000",
    jobType: "Full-time",
    category: "Marketing",
    applicationUrl: "https://brandboost.com/marketing",
    source: "MyJobMag",
    datePosted: new Date(Date.now() - 345600000), // 4 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Lagos, Nigeria",
    description: "Manage cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes is essential.",
    salary: "₦600,000 - ₦900,000",
    jobType: "Full-time",
    category: "Technology",
    applicationUrl: "https://cloudtech.com/devops",
    source: "Hot Nigerian Jobs",
    datePosted: new Date(Date.now() - 432000000), // 5 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Content Writer",
    company: "MediaHub Nigeria",
    location: "Abuja, Nigeria",
    description: "Create engaging content for websites, blogs, and social media. Strong writing skills and SEO knowledge required.",
    salary: "₦250,000 - ₦400,000",
    jobType: "Contract",
    category: "Marketing",
    applicationUrl: "https://mediahub.ng/writer",
    source: "Jobberman",
    datePosted: new Date(Date.now() - 518400000), // 6 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Mobile App Developer",
    company: "AppWorks Studio",
    location: "Lagos, Nigeria",
    description: "Develop native mobile applications for iOS and Android. Experience with React Native or Flutter preferred.",
    salary: "₦550,000 - ₦750,000",
    jobType: "Full-time",
    category: "Technology",
    applicationUrl: "https://appworks.ng/mobile-dev",
    source: "MyJobMag",
    datePosted: new Date(Date.now() - 604800000), // 1 week ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "HR Manager",
    company: "PeopleFirst Corp",
    location: "Lagos, Nigeria",
    description: "Oversee human resources operations including recruitment, employee relations, and performance management.",
    salary: "₦500,000 - ₦700,000",
    jobType: "Full-time",
    category: "Human Resources",
    applicationUrl: "https://peoplefirst.com/hr-manager",
    source: "Hot Nigerian Jobs",
    datePosted: new Date(Date.now() - 691200000), // 8 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Graphic Designer",
    company: "DesignStudio NG",
    location: "Port Harcourt, Nigeria",
    description: "Create visual content for print and digital media. Proficiency in Adobe Creative Suite required.",
    salary: "₦300,000 - ₦450,000",
    jobType: "Full-time",
    category: "Design",
    applicationUrl: "https://designstudio.ng/graphic-designer",
    source: "Jobberman",
    datePosted: new Date(Date.now() - 777600000), // 9 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Business Analyst",
    company: "ConsultPro Nigeria",
    location: "Abuja, Nigeria",
    description: "Analyze business processes and provide recommendations for improvement. Experience in requirements gathering and process optimization.",
    salary: "₦450,000 - ₦650,000",
    jobType: "Full-time",
    category: "Business",
    applicationUrl: "https://consultpro.ng/business-analyst",
    source: "MyJobMag",
    datePosted: new Date(Date.now() - 864000000), // 10 days ago
    scrapedAt: new Date(),
    isActive: true
  },
  {
    title: "Customer Support Specialist",
    company: "ServicePlus Ltd",
    location: "Lagos, Nigeria",
    description: "Provide excellent customer service and support. Handle inquiries, resolve issues, and maintain customer satisfaction.",
    salary: "₦200,000 - ₦350,000",
    jobType: "Full-time",
    category: "Customer Service",
    applicationUrl: "https://serviceplus.ng/support",
    source: "Hot Nigerian Jobs",
    datePosted: new Date(Date.now() - 950400000), // 11 days ago
    scrapedAt: new Date(),
    isActive: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-aggregator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert sample jobs
    await Job.insertMany(sampleJobs);
    console.log(`Seeded ${sampleJobs.length} sample jobs`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();