import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';

dotenv.config();


const initialCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    itemsCount: "120+",
    homepageImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop",
    homepageColor: "bg-blue-50",
    heroTitle: "Tech & Electronics",
    heroSubtitle: "Discover the latest gadgets, smart devices, and premium audio equipment",
    heroImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000&auto=format&fit=crop",
    heroBg: "bg-[#eef2f5]",
    subCategories: [
      { name: "Mobiles", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop" },
      { name: "Audio", img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop" },
      { name: "Smart Home", img: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=300&h=300&fit=crop" }
    ],
    tabs: ['Phones', 'Audio']
  },
  {
    name: "Fashion",
    slug: "fashion",
    itemsCount: "200+",
    homepageImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=150&fit=crop",
    homepageColor: "bg-pink-50",
    heroTitle: "Fashion & Style",
    heroSubtitle: "Our always-in-season staple, in brand new colors and your favorite fits",
    heroImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop",
    heroBg: "bg-[#f5f5f5]",
    subCategories: [
      { name: "Menswear", img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=300&h=300&fit=crop" },
      { name: "Womenswear", img: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=300&h=300&fit=crop" },
      { name: "Kids Fashion", img: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=300&h=300&fit=crop" },
      { name: "Accessories", img: "/images/accessories.png" }
    ],
    tabs: ['Men', 'Women', 'Kids']
  },
  {
    name: "Home & Living",
    slug: "home-living",
    itemsCount: "150+",
    homepageImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&h=150&fit=crop",
    homepageColor: "bg-orange-50",
    heroTitle: "Home & Living",
    heroSubtitle: "Upgrade your space with modern furniture and essential home decor",
    heroImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop",
    heroBg: "bg-[#fdf4eb]",
    subCategories: [
      { name: "Furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop" },
      { name: "Decor", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&h=300&fit=crop" },
      { name: "Kitchen", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&h=300&fit=crop" },
      { name: "Lighting", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop" }
    ],
    tabs: ['Furniture', 'Decor', 'Kitchen']
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    itemsCount: "100+",
    homepageImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop",
    homepageColor: "bg-purple-50",
    heroTitle: "Beauty & Health",
    heroSubtitle: "Premium skincare, makeup, and wellness products for your daily routine",
    heroImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
    heroBg: "bg-[#fcecf1]",
    subCategories: [
      { name: "Skincare", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop" },
      { name: "Makeup", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop" },
      { name: "Fragrance", img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=300&fit=crop" },
      { name: "Wellness", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop" }
    ],
    tabs: ['Skincare', 'Makeup', 'Wellness']
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    itemsCount: "80+",
    homepageImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&h=150&fit=crop",
    homepageColor: "bg-green-50",
    heroTitle: "Sports & Outdoors",
    heroSubtitle: "Gear up for your next adventure with professional sports equipment",
    heroImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop",
    heroBg: "bg-[#eaf5e9]",
    subCategories: [
      { name: "Fitness", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop" },
      { name: "Camping", img: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=300&h=300&fit=crop" },
      { name: "Cycling", img: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=300&h=300&fit=crop" },
      { name: "Running", img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&h=300&fit=crop" }
    ],
    tabs: ['Fitness', 'Camping', 'Cycling']
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    itemsCount: "70+",
    homepageImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=150&h=150&fit=crop",
    homepageColor: "bg-yellow-50",
    heroTitle: "Toys & Games",
    heroSubtitle: "Fun and educational toys for kids of all ages",
    heroImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=1000&auto=format&fit=crop",
    heroBg: "bg-[#fff7e6]",
    subCategories: [
      { name: "Action Figures", img: "https://images.pexels.com/photos/5727367/pexels-photo-5727367.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" },
      { name: "Board Games", img: "https://images.pexels.com/photos/7234448/pexels-photo-7234448.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" },
      { name: "Educational", img: "https://images.pexels.com/photos/7269671/pexels-photo-7269671.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" },
      { name: "Puzzles", img: "https://images.pexels.com/photos/5275836/pexels-photo-5275836.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" }
    ],
    tabs: ['Toys', 'Games', 'Puzzles']
  },
  {
    name: "Books & More",
    slug: "books",
    itemsCount: "90+",
    homepageImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&h=150&fit=crop",
    homepageColor: "bg-cyan-50",
    heroTitle: "Books & More",
    heroSubtitle: "Expand your mind with bestsellers, fiction, and non-fiction",
    heroImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop",
    heroBg: "bg-[#eaf1f1]",
    subCategories: [
      { name: "Fiction", img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=300&fit=crop" },
      { name: "Non-Fiction", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=300&fit=crop" },
      { name: "Children", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop" },
      { name: "Education", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop" }
    ],
    tabs: ['Fiction', 'Non-Fiction', 'Children']
  }
];

const seedCategories = async () => {
  try {
    await connectDB();
    await Category.deleteMany();
    await Category.insertMany(initialCategories);
    console.log('Categories Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedCategories();
