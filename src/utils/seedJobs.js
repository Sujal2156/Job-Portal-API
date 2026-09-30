import { Job } from "../models/job.model.js";

const sampleJobs = [
    {
        title: "Senior Backend Engineer (Node.js)",
        company: "FinTech Innovations Inc.",
        location: "Remote",
        jobType: "Full-time",
        description: "We are looking for a skilled Senior Backend Engineer to architect, build, and maintain high-throughput microservices using Node.js, Express, and MongoDB. You will collaborate with cross-functional teams to design secure APIs, optimize database queries, and implement CI/CD pipelines.",
        requirements: [
            "4+ years of professional backend development with Node.js and Express",
            "Solid experience with MongoDB, indexing, aggregation, and Mongoose",
            "Hands-on experience with RESTful API design, JWT authentication, and security standards",
            "Familiarity with Docker, Git, and cloud deployments (AWS/Render/GCP)"
        ],
        salary: "$110,000 - $140,000 / year",
        status: "active"
    },
    {
        title: "Full Stack Developer (React & Node.js)",
        company: "CloudScale Technologies",
        location: "Bangalore, India (Hybrid)",
        jobType: "Full-time",
        description: "Join our high-growth SaaS engineering team. As a Full Stack Developer, you will build user-facing web applications in React while developing scalable RESTful services with Node.js.",
        requirements: [
            "2+ years of experience with React.js and Node.js",
            "Proficiency in REST APIs, State Management, and CSS/Tailwind",
            "Experience working with NoSQL databases like MongoDB",
            "Strong problem-solving and debugging skills"
        ],
        salary: "₹12,00,000 - ₹18,00,000 / year",
        status: "active"
    },
    {
        title: "Junior Backend Developer",
        company: "NextGen Digital Labs",
        location: "Remote",
        jobType: "Full-time",
        description: "Great opportunity for early-career developers looking to work on modern cloud backend architectures. You will write clean, well-tested Node.js code and assist in API documentation and testing.",
        requirements: [
            "Strong fundamentals in JavaScript, Node.js, and Express",
            "Basic knowledge of MongoDB or relational databases",
            "Familiarity with Postman and API testing",
            "Eager to learn and work in an agile team"
        ],
        salary: "₹6,00,000 - ₹9,00,000 / year",
        status: "active"
    },
    {
        title: "DevOps & Cloud Engineer",
        company: "StreamLine Systems",
        location: "Remote",
        jobType: "Contract",
        description: "Looking for a DevOps engineer to set up automated build, test, and release pipelines, containerization with Docker, and cloud monitoring.",
        requirements: [
            "Experience with Docker, Kubernetes, and CI/CD tools (GitHub Actions)",
            "Hands-on experience with AWS / Render / DigitalOcean",
            "Strong scripting skills in Bash or Python",
            "Understanding of web security and networking protocols"
        ],
        salary: "$70 - $90 / hour",
        status: "active"
    },
    {
        title: "Frontend Engineer (React & TypeScript)",
        company: "Pulse Creative Studios",
        location: "Mumbai, India",
        jobType: "Full-time",
        description: "Create delightful and responsive user interfaces for modern web applications. Work closely with product designers and backend engineers to integrate APIs seamlessly.",
        requirements: [
            "3+ years of experience in React, TypeScript, and modern CSS",
            "Experience consuming REST and GraphQL APIs",
            "Focus on web performance, accessibility, and clean UI/UX"
        ],
        salary: "₹10,00,000 - ₹15,00,000 / year",
        status: "active"
    }
];

export const seedJobs = async () => {
    try {
        const count = await Job.countDocuments();
        if (count === 0) {
            await Job.insertMany(sampleJobs);
            console.log("Sample jobs seeded successfully");
        }
    } catch (error) {
        console.error("Error seeding jobs:", error.message);
    }
};
