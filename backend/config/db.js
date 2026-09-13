const mongoose = require('mongoose');

const Admin = require('../models/Admin');
const Operator = require('../models/Operator');
const Ad = require('../models/Ad');

const seedDefaults = async () => {
  try {
    // 1. Seed Admin (Max Access)
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Seeding default super admin...');
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'Admin@1234',
        role: 'admin'
      });
      console.log('✅ Super Admin created successfully! (admin / Admin@1234)');
    }

    // 2. Seed Tiered Operators (Min to Max Access)
    const operatorCount = await Operator.countDocuments();
    if (operatorCount === 0) {
      console.log('🌱 Seeding default operator access tiers (Min to Max)...');
      const sampleOperators = [
        {
          name: 'Ramesh Varma (Senior Lead)',
          age: 36,
          phone: '9876543210',
          password: 'Operator@123',
          email: 'ramesh.lead@digitalseva.in',
          address: 'Main Road, Hanamkonda, Warangal',
          whatsapp: '9876543210',
          bio: 'Senior Citizen & Government Schemes Specialist with 8+ years experience.',
          role: 'senior_operator',
          permissions: {
            canUpdateStatus: true,
            canAddNotes: true,
            canViewAllRequests: true,
            canExportContacts: true,
            canEditProfile: true
          },
          sortOrder: 0,
          isActive: true
        },
        {
          name: 'Suresh Kumar (Standard Op)',
          age: 29,
          phone: '9876543211',
          password: 'Operator@123',
          email: 'suresh.op@digitalseva.in',
          address: 'Near Bus Stand, Kazipet',
          whatsapp: '9876543211',
          bio: 'PAN, Aadhaar & Scholarship applications specialist.',
          role: 'operator',
          permissions: {
            canUpdateStatus: true,
            canAddNotes: true,
            canViewAllRequests: false,
            canExportContacts: false,
            canEditProfile: true
          },
          sortOrder: 1,
          isActive: true
        },
        {
          name: 'Priya Sharma (Trainee)',
          age: 23,
          phone: '9876543212',
          password: 'Operator@123',
          email: 'priya.trainee@digitalseva.in',
          address: 'Subedari, Warangal',
          whatsapp: '9876543212',
          bio: 'Customer assistance & document verification intern.',
          role: 'trainee_operator',
          permissions: {
            canUpdateStatus: false,
            canAddNotes: true,
            canViewAllRequests: false,
            canExportContacts: false,
            canEditProfile: false
          },
          sortOrder: 2,
          isActive: true
        }
      ];

      for (const op of sampleOperators) {
        await Operator.create(op);
      }
      console.log('✅ Tiered operators seeded successfully!');
    } else {
      // Auto-heal existing operators in database that were created before the password field existed
      const bcrypt = require('bcryptjs');
      const opsWithoutPassword = await Operator.find({
        $or: [
          { password: { $exists: false } },
          { password: null },
          { password: '' }
        ]
      });
      if (opsWithoutPassword.length > 0) {
        console.log(`🔧 Backfilling password for ${opsWithoutPassword.length} existing operators...`);
        const salt = await bcrypt.genSalt(10);
        const defaultHashedPassword = await bcrypt.hash('Operator@123', salt);
        for (const op of opsWithoutPassword) {
          await Operator.updateOne(
            { _id: op._id },
            {
              $set: {
                password: defaultHashedPassword,
                role: op.role || 'operator',
                permissions: op.permissions || {
                  canUpdateStatus: true,
                  canAddNotes: true,
                  canViewAllRequests: false,
                  canExportContacts: false,
                  canEditProfile: true
                }
              }
            }
          );
        }
        console.log('✅ Existing operators updated with default credentials (Operator@123)!');
      }
    }

    // 3. Seed Sample Marketing Ads (Multi-format: Image, SVG, Video, PDF, GIF, Document)
    const adCount = await Ad.countDocuments();
    if (adCount === 0) {
      console.log('🌱 Seeding sample marketing ads across all supported formats...');
      const sampleAds = [
        {
          title: 'Fast Track PAN Card Service — 24hr Dispatch',
          mediaUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&q=80',
          mediaType: 'image',
          linkUrl: 'https://wa.me/919876543210?text=Hi%2C%20I%20want%20urgent%20PAN%20service',
          description: 'Instant PAN correction and new card processing with doorstep biometric verification.',
          badge: 'Exclusive Offer',
          placement: 'post_details',
          isActive: true,
          sortOrder: 0
        },
        {
          title: 'How to Apply Online Step-by-Step Guide',
          mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          mediaType: 'video',
          linkUrl: 'https://digitalseva.gov.in',
          description: 'Watch the quick 1-minute video walk-through on how our operators assist you end-to-end.',
          badge: 'Video Tutorial',
          placement: 'post_details',
          isActive: true,
          sortOrder: 1
        },
        {
          title: 'Government Scholarship Eligibility & Guidelines PDF',
          mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          mediaType: 'pdf',
          linkUrl: 'https://telanganaepass.cgg.gov.in/',
          description: 'Official brochure containing complete list of eligible courses, income thresholds & documents.',
          badge: 'Official PDF Brochure',
          placement: 'post_details',
          isActive: true,
          sortOrder: 2
        },
        {
          title: 'Special Festival Cashback Offer',
          mediaUrl: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
          mediaType: 'gif',
          linkUrl: 'https://wa.me/919876543210',
          description: 'Get ₹50 flat cashback on online utility payments this festive month!',
          badge: 'Limited Time GIF Promo',
          placement: 'post_details',
          isActive: true,
          sortOrder: 3
        }
      ];

      for (const ad of sampleAds) {
        await Ad.create(ad);
      }
      console.log('✅ Sample marketing ads seeded successfully!');
    }
  } catch (err) {
    console.error('Seeding error (non-fatal):', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDefaults();
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
