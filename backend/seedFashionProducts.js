import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedFashionProducts = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found! Please run the main seeder first.');
      process.exit(1);
    }

    const adminId = adminUser._id;

    // ============================================================
    // MEN'S FASHION PRODUCTS (subCategory: "Men")
    // ============================================================
    const menProducts = [
      {
        user: adminId,
        name: 'Premium Navy Slim-Fit Formal Suit',
        image: '/products/men_formal_suit.png',
        images: ['/products/men_formal_suit.png'],
        brand: 'ClassicMan',
        category: 'Fashion',
        subCategory: 'Men',
        description: 'Impeccably tailored navy blue slim-fit suit crafted from premium Italian wool blend. Features a notch lapel, two-button closure, and functional surgeon cuffs. Perfect for business meetings, formal events, and special occasions. Comes with matching trousers.',
        features: [
          'Premium Italian wool blend fabric',
          'Slim-fit modern cut',
          'Fully lined with satin interior',
          'Functional surgeon cuffs',
          'Matching flat-front trousers included',
        ],
        colors: ['Navy Blue', 'Charcoal', 'Black'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        specifications: [
          { key: 'Material', value: '65% Wool, 30% Polyester, 5% Elastane' },
          { key: 'Fit', value: 'Slim Fit' },
          { key: 'Closure', value: 'Two-Button' },
          { key: 'Care', value: 'Dry Clean Only' },
        ],
        rating: 4.8,
        numReviews: 34,
        price: 45000,
        originalPrice: 65000,
        discountedPrice: 45000,
        countInStock: 20,
        orders: 156,
      },
      {
        user: adminId,
        name: 'Brown Leather Bomber Jacket',
        image: '/products/men_casual_jacket.png',
        images: ['/products/men_casual_jacket.png'],
        brand: 'UrbanEdge',
        category: 'Fashion',
        subCategory: 'Men',
        description: 'Premium genuine leather bomber jacket in rich brown. Features a ribbed collar, cuffs, and hem for a classic silhouette. Full zip-up front with multiple interior and exterior pockets. A timeless piece for every man\'s wardrobe.',
        features: [
          'Genuine premium leather',
          'Classic bomber silhouette',
          'Ribbed collar, cuffs & hem',
          'Multiple interior pockets',
          'Full YKK zip closure',
        ],
        colors: ['Brown', 'Black', 'Tan'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        specifications: [
          { key: 'Material', value: '100% Genuine Leather' },
          { key: 'Lining', value: '100% Polyester' },
          { key: 'Closure', value: 'Zip-Up' },
          { key: 'Care', value: 'Professional Leather Clean' },
        ],
        rating: 4.9,
        numReviews: 28,
        price: 38000,
        originalPrice: 52000,
        discountedPrice: 38000,
        countInStock: 12,
        orders: 89,
      },
      {
        user: adminId,
        name: 'Classic Black Cotton Polo Shirt',
        image: '/products/men_polo_shirt.png',
        images: ['/products/men_polo_shirt.png'],
        brand: 'ThreadWorks',
        category: 'Fashion',
        subCategory: 'Men',
        description: 'Timeless black polo shirt made from premium long-staple cotton piqué. Features a classic two-button placket, ribbed collar and cuffs, and subtle embroidered logo. The perfect blend of casual elegance and everyday comfort.',
        features: [
          'Premium cotton piqué fabric',
          'Classic two-button placket',
          'Ribbed collar and cuffs',
          'Subtle embroidered logo',
          'Pre-shrunk fabric',
        ],
        colors: ['Black', 'White', 'Navy', 'Olive', 'Burgundy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        specifications: [
          { key: 'Material', value: '100% Long-Staple Cotton' },
          { key: 'Fit', value: 'Regular Fit' },
          { key: 'Weight', value: '220 GSM' },
          { key: 'Care', value: 'Machine Washable' },
        ],
        rating: 4.6,
        numReviews: 72,
        price: 4500,
        originalPrice: 6500,
        discountedPrice: 4500,
        countInStock: 150,
        orders: 420,
      },
      {
        user: adminId,
        name: 'Dark Indigo Slim-Fit Denim Jeans',
        image: '/products/men_denim_jeans.png',
        images: ['/products/men_denim_jeans.png'],
        brand: 'DenimCraft',
        category: 'Fashion',
        subCategory: 'Men',
        description: 'Premium dark indigo slim-fit jeans crafted from Japanese selvedge denim. Features classic five-pocket styling, riveted stress points, and a slight stretch for all-day comfort. The perfect pair that transitions seamlessly from casual to smart-casual.',
        features: [
          'Japanese selvedge denim',
          'Slim-fit with stretch',
          'Classic five-pocket design',
          'Riveted stress points',
          'YKK zip fly closure',
        ],
        colors: ['Dark Indigo', 'Black', 'Medium Wash'],
        sizes: ['28', '30', '32', '34', '36', '38'],
        specifications: [
          { key: 'Material', value: '98% Cotton, 2% Elastane' },
          { key: 'Fit', value: 'Slim Fit' },
          { key: 'Weight', value: '12.5 oz Denim' },
          { key: 'Care', value: 'Machine Wash Cold' },
        ],
        rating: 4.7,
        numReviews: 95,
        price: 8500,
        originalPrice: 12000,
        discountedPrice: 8500,
        countInStock: 80,
        orders: 310,
      },
      {
        user: adminId,
        name: 'Premium White Minimalist Sneakers',
        image: '/products/men_sneakers.png',
        images: ['/products/men_sneakers.png'],
        brand: 'AirFit',
        category: 'Fashion',
        subCategory: 'Men',
        description: 'Clean, minimalist white sneakers crafted from premium full-grain leather. Features a cushioned memory foam insole, durable rubber outsole, and a sleek low-profile silhouette. The ultimate everyday shoe that pairs with everything.',
        features: [
          'Premium full-grain leather upper',
          'Memory foam insole',
          'Durable rubber outsole',
          'Tonal stitching details',
          'Padded collar for comfort',
        ],
        colors: ['White', 'White/Gum', 'Off-White'],
        sizes: ['40', '41', '42', '43', '44', '45'],
        specifications: [
          { key: 'Upper', value: 'Full-Grain Leather' },
          { key: 'Sole', value: 'Rubber' },
          { key: 'Insole', value: 'Memory Foam' },
          { key: 'Care', value: 'Wipe with Damp Cloth' },
        ],
        rating: 4.8,
        numReviews: 63,
        price: 12500,
        originalPrice: 18000,
        discountedPrice: 12500,
        countInStock: 45,
        orders: 198,
      },
    ];

    // ============================================================
    // WOMEN'S FASHION PRODUCTS (subCategory: "Women")
    // ============================================================
    const womenProducts = [
      {
        user: adminId,
        name: 'Elegant Floral Summer Maxi Dress',
        image: '/products/women_summer_dress.png',
        images: ['/products/women_summer_dress.png'],
        brand: 'Eleganza',
        category: 'Fashion',
        subCategory: 'Women',
        description: 'Stunning floor-length maxi dress featuring a delicate floral print in soft pinks and greens. Made from lightweight, flowy chiffon with a fitted bodice, adjustable spaghetti straps, and a flattering A-line silhouette. Perfect for summer parties, beach weddings, and resort wear.',
        features: [
          'Lightweight chiffon fabric',
          'Delicate floral print',
          'Adjustable spaghetti straps',
          'Built-in lining',
          'Side zip closure',
        ],
        colors: ['Floral Pink', 'Floral Blue', 'Floral Lavender'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        specifications: [
          { key: 'Material', value: '100% Polyester Chiffon' },
          { key: 'Length', value: 'Floor Length' },
          { key: 'Fit', value: 'A-Line' },
          { key: 'Care', value: 'Hand Wash Cold' },
        ],
        rating: 4.9,
        numReviews: 48,
        price: 9500,
        originalPrice: 14000,
        discountedPrice: 9500,
        countInStock: 35,
        orders: 245,
      },
      {
        user: adminId,
        name: 'Luxury Leather Tote Handbag',
        image: '/products/women_handbag.png',
        images: ['/products/women_handbag.png'],
        brand: 'LuxeCarry',
        category: 'Fashion',
        subCategory: 'Women',
        description: 'Sophisticated beige leather tote crafted from premium Italian leather with elegant gold hardware accents. Features a spacious main compartment, interior zip pocket, and phone slot. The structured silhouette and detachable shoulder strap make it perfect for work or weekend.',
        features: [
          'Premium Italian leather',
          'Gold-tone hardware accents',
          'Spacious main compartment',
          'Interior zip & slot pockets',
          'Detachable shoulder strap',
        ],
        colors: ['Beige', 'Black', 'Cognac', 'Burgundy'],
        sizes: ['One Size'],
        specifications: [
          { key: 'Material', value: '100% Genuine Italian Leather' },
          { key: 'Dimensions', value: '35cm x 28cm x 14cm' },
          { key: 'Hardware', value: 'Gold-Tone Metal' },
          { key: 'Care', value: 'Use Leather Conditioner' },
        ],
        rating: 4.8,
        numReviews: 56,
        price: 22000,
        originalPrice: 32000,
        discountedPrice: 22000,
        countInStock: 18,
        orders: 167,
      },
      {
        user: adminId,
        name: 'Tailored Dusty Rose Blazer',
        image: '/products/women_blazer.png',
        images: ['/products/women_blazer.png'],
        brand: 'ModaChic',
        category: 'Fashion',
        subCategory: 'Women',
        description: 'Effortlessly chic tailored blazer in a beautiful dusty rose hue. Features a modern oversized fit with padded shoulders, single-button closure, and functional flap pockets. Perfect for elevating any outfit from office to evening.',
        features: [
          'Modern oversized fit',
          'Padded shoulders',
          'Single-button closure',
          'Functional flap pockets',
          'Fully lined interior',
        ],
        colors: ['Dusty Rose', 'Ivory', 'Black', 'Sage Green'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        specifications: [
          { key: 'Material', value: '70% Polyester, 25% Rayon, 5% Spandex' },
          { key: 'Fit', value: 'Oversized' },
          { key: 'Closure', value: 'Single Button' },
          { key: 'Care', value: 'Dry Clean Recommended' },
        ],
        rating: 4.7,
        numReviews: 39,
        price: 14500,
        originalPrice: 20000,
        discountedPrice: 14500,
        countInStock: 28,
        orders: 134,
      },
      {
        user: adminId,
        name: 'Nude Pointed-Toe Stiletto Heels',
        image: '/products/women_heels.png',
        images: ['/products/women_heels.png'],
        brand: 'Eleganza',
        category: 'Fashion',
        subCategory: 'Women',
        description: 'Timeless nude stiletto pumps crafted from smooth premium leather. Features a classic pointed-toe silhouette, 10cm heel height, and cushioned insole for all-day comfort. The ultimate wardrobe staple that elongates legs and complements every outfit.',
        features: [
          'Premium smooth leather',
          'Classic pointed-toe design',
          'Cushioned insole',
          '10cm stiletto heel',
          'Non-slip rubber sole pad',
        ],
        colors: ['Nude', 'Black', 'Red', 'White'],
        sizes: ['36', '37', '38', '39', '40', '41'],
        specifications: [
          { key: 'Upper', value: 'Genuine Leather' },
          { key: 'Heel Height', value: '10cm / 4 inches' },
          { key: 'Sole', value: 'Leather with Rubber Pad' },
          { key: 'Care', value: 'Wipe with Soft Cloth' },
        ],
        rating: 4.6,
        numReviews: 41,
        price: 16000,
        originalPrice: 24000,
        discountedPrice: 16000,
        countInStock: 22,
        orders: 178,
      },
      {
        user: adminId,
        name: 'Premium Activewear Set — Sports Bra & Leggings',
        image: '/products/women_activewear.png',
        images: ['/products/women_activewear.png'],
        brand: 'FlexFit',
        category: 'Fashion',
        subCategory: 'Women',
        description: 'High-performance matching workout set in deep purple. Includes a supportive sports bra with removable pads and high-waisted compression leggings. Made from moisture-wicking, four-way stretch fabric that moves with you. Squat-proof and fade-resistant.',
        features: [
          'Moisture-wicking fabric',
          'Four-way stretch',
          'Removable sports bra pads',
          'High-waisted compression fit',
          'Squat-proof & fade-resistant',
        ],
        colors: ['Deep Purple', 'Black', 'Forest Green', 'Wine Red'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        specifications: [
          { key: 'Material', value: '75% Nylon, 25% Spandex' },
          { key: 'Support', value: 'Medium Support Sports Bra' },
          { key: 'Waist', value: 'High-Rise Compression' },
          { key: 'Care', value: 'Machine Wash Cold, No Dryer' },
        ],
        rating: 4.9,
        numReviews: 87,
        price: 7500,
        originalPrice: 11000,
        discountedPrice: 7500,
        countInStock: 60,
        orders: 523,
      },
    ];

    // ============================================================
    // KIDS' FASHION PRODUCTS (subCategory: "Kids")
    // ============================================================
    const kidsProducts = [
      {
        user: adminId,
        name: 'Boys\' Colorful Striped T-Shirt & Shorts Set',
        image: '/products/kids_outfit_boy.png',
        images: ['/products/kids_outfit_boy.png'],
        brand: 'LittleStars',
        category: 'Fashion',
        subCategory: 'Kids',
        description: 'Fun and comfortable boys\' casual outfit set. Includes a vibrant colorful striped cotton t-shirt paired with sturdy denim shorts. Made from soft, breathable fabrics that allow kids to play freely. Easy pull-on style with elastic waistband on shorts.',
        features: [
          'Soft breathable cotton',
          'Vibrant colorful stripes',
          'Elastic waistband shorts',
          'Machine washable',
          'Pre-shrunk fabric',
        ],
        colors: ['Multi-Stripe/Blue', 'Multi-Stripe/Red', 'Multi-Stripe/Green'],
        sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
        specifications: [
          { key: 'T-Shirt Material', value: '100% Cotton' },
          { key: 'Shorts Material', value: '100% Cotton Denim' },
          { key: 'Age Range', value: '3-12 Years' },
          { key: 'Care', value: 'Machine Wash Warm' },
        ],
        rating: 4.7,
        numReviews: 63,
        price: 3200,
        originalPrice: 4800,
        discountedPrice: 3200,
        countInStock: 90,
        orders: 287,
      },
      {
        user: adminId,
        name: 'Girls\' Sparkle Pink Princess Party Dress',
        image: '/products/kids_party_dress.png',
        images: ['/products/kids_party_dress.png'],
        brand: 'TinyTrend',
        category: 'Fashion',
        subCategory: 'Kids',
        description: 'Enchanting princess-style party dress in soft pink with layers of tulle and delicate sparkle accents. Features a fitted satin bodice, bow detail at the waist, and a full tutu-style skirt. Perfect for birthdays, parties, and special occasions.',
        features: [
          'Satin bodice with sparkle details',
          'Layered tulle tutu skirt',
          'Beautiful bow waist detail',
          'Comfortable cotton lining',
          'Back zip closure',
        ],
        colors: ['Pink', 'Lavender', 'White', 'Peach'],
        sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
        specifications: [
          { key: 'Outer Material', value: 'Polyester Tulle & Satin' },
          { key: 'Lining', value: '100% Cotton' },
          { key: 'Age Range', value: '2-11 Years' },
          { key: 'Care', value: 'Hand Wash Cold' },
        ],
        rating: 4.9,
        numReviews: 78,
        price: 4500,
        originalPrice: 6500,
        discountedPrice: 4500,
        countInStock: 55,
        orders: 412,
      },
      {
        user: adminId,
        name: 'Kids\' Cozy Graphic Zip-Up Hoodie',
        image: '/products/kids_hoodie.png',
        images: ['/products/kids_hoodie.png'],
        brand: 'LittleStars',
        category: 'Fashion',
        subCategory: 'Kids',
        description: 'Super cozy zip-up hoodie in bright blue with fun graphic print on the back. Made from soft brushed fleece that keeps kids warm and comfortable. Features kangaroo pockets, ribbed cuffs and hem, and a durable YKK zipper. Great for school, play, and cool weather.',
        features: [
          'Soft brushed fleece interior',
          'Fun graphic back print',
          'Kangaroo front pockets',
          'Durable YKK zip closure',
          'Ribbed cuffs and hem',
        ],
        colors: ['Bright Blue', 'Red', 'Grey', 'Green'],
        sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
        specifications: [
          { key: 'Material', value: '80% Cotton, 20% Polyester Fleece' },
          { key: 'Weight', value: '320 GSM' },
          { key: 'Age Range', value: '3-12 Years' },
          { key: 'Care', value: 'Machine Wash Warm' },
        ],
        rating: 4.8,
        numReviews: 54,
        price: 3800,
        originalPrice: 5500,
        discountedPrice: 3800,
        countInStock: 75,
        orders: 198,
      },
      {
        user: adminId,
        name: 'Kids\' Colorful Sport Sneakers',
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&auto=format&fit=crop&q=80'],
        brand: 'TinySteps',
        category: 'Fashion',
        subCategory: 'Kids',
        description: 'Vibrant and fun kids\' sport sneakers with lightweight cushioned sole. Features bright colorful design that kids love, easy velcro strap closure, and a breathable mesh upper. Designed for active kids who need comfort and style.',
        features: [
          'Lightweight cushioned sole',
          'Easy velcro strap closure',
          'Breathable mesh upper',
          'Non-marking rubber outsole',
          'Reinforced toe cap',
        ],
        colors: ['Red/White', 'Blue/Yellow', 'Pink/Purple'],
        sizes: ['25', '26', '27', '28', '29', '30', '31', '32', '33'],
        specifications: [
          { key: 'Upper', value: 'Breathable Mesh & Synthetic' },
          { key: 'Sole', value: 'Lightweight EVA + Rubber' },
          { key: 'Closure', value: 'Velcro Strap' },
          { key: 'Age Range', value: '3-10 Years' },
        ],
        rating: 4.6,
        numReviews: 45,
        price: 4200,
        originalPrice: 6000,
        discountedPrice: 4200,
        countInStock: 65,
        orders: 234,
      },
      {
        user: adminId,
        name: 'Kids\' Smart School Uniform Set',
        image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80'],
        brand: 'TinyTrend',
        category: 'Fashion',
        subCategory: 'Kids',
        description: 'Smart and durable school uniform set including a crisp white polo shirt and navy blue shorts/skirt. Made from easy-care, wrinkle-resistant fabric that maintains its shape wash after wash. Features reinforced seams for extra durability.',
        features: [
          'Wrinkle-resistant fabric',
          'Reinforced seams for durability',
          'Easy-care machine washable',
          'Comfortable all-day wear',
          'Maintains shape after washing',
        ],
        colors: ['White/Navy', 'White/Grey', 'White/Black'],
        sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'],
        specifications: [
          { key: 'Polo Material', value: '65% Polyester, 35% Cotton' },
          { key: 'Shorts Material', value: '100% Polyester Twill' },
          { key: 'Age Range', value: '4-13 Years' },
          { key: 'Care', value: 'Machine Wash, Tumble Dry Low' },
        ],
        rating: 4.5,
        numReviews: 38,
        price: 3500,
        originalPrice: 5000,
        discountedPrice: 3500,
        countInStock: 100,
        orders: 356,
      },
    ];

    const allFashionProducts = [...menProducts, ...womenProducts, ...kidsProducts];

    // Delete existing fashion products only (preserve other categories)
    await Product.deleteMany({ category: 'Fashion' });
    console.log('🗑️  Cleared existing Fashion products.');

    // Insert all fashion products
    const inserted = await Product.insertMany(allFashionProducts);
    console.log(`\n✅ Successfully seeded ${inserted.length} Fashion products!`);
    console.log(`   👔 Men's:   ${menProducts.length} products`);
    console.log(`   👗 Women's: ${womenProducts.length} products`);
    console.log(`   👶 Kids':   ${kidsProducts.length} products`);
    console.log('\nProducts created:');
    inserted.forEach((p) => {
      console.log(`   • [${p.subCategory}] ${p.name} — LKR ${p.price.toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding fashion products: ${error.message}`);
    process.exit(1);
  }
};

seedFashionProducts();
