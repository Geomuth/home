module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const query = req.query.q?.toLowerCase().trim() || '';

    const blogs = [
        {
            id: 1,
            title: 'Introduction to AI Technology',
            excerpt: 'Explore the fundamentals of artificial intelligence and its applications in modern technology.',
            category: 'AI',
            date: 'Feb 10, 2026',
            emoji: '🤖'
        },
        {
            id: 2,
            title: 'Web Development Best Practices',
            excerpt: 'Learn the latest techniques and best practices for building scalable web applications.',
            category: 'Web Dev',
            date: 'Feb 08, 2026',
            emoji: '🌐'
        },
        {
            id: 3,
            title: 'Cloud Computing Essentials',
            excerpt: 'Understanding cloud infrastructure, deployment strategies, and cost optimization.',
            category: 'Cloud',
            date: 'Feb 05, 2026',
            emoji: '☁️'
        },
        {
            id: 4,
            title: 'Cybersecurity Tips & Tricks',
            excerpt: 'Essential cybersecurity practices to protect your digital assets and data.',
            category: 'Security',
            date: 'Feb 03, 2026',
            emoji: '🔒'
        },
        {
            id: 5,
            title: 'Mobile App Development',
            excerpt: 'Building responsive and efficient mobile applications for iOS and Android.',
            category: 'Mobile',
            date: 'Jan 30, 2026',
            emoji: '📱'
        },
        {
            id: 6,
            title: 'Data Science & Analytics',
            excerpt: 'Leveraging data to make informed business decisions and predictions.',
            category: 'Data',
            date: 'Jan 28, 2026',
            emoji: '📊'
        }
    ];

    if (query) {
        const results = blogs.filter(blog =>
            blog.title.toLowerCase().includes(query) ||
            blog.excerpt.toLowerCase().includes(query) ||
            blog.category.toLowerCase().includes(query)
        );
        return res.status(200).json(results);
    }

    res.status(200).json(blogs);
};
