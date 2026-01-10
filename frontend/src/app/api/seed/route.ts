import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();
    
    // Seed Blood Banks
    const bankCount = await BloodBank.countDocuments();
    let bankMessage = "Blood banks already exist";
    
    if (bankCount === 0) {
      const sampleBanks = [
        {
          name: "City General Hospital Blood Bank",
          email: "bloodbank@citygeneral.com",
          phone: "555-0101",
          address: {
            street: "123 Healthcare Ave",
            city: "Metropolis",
            state: "NY",
            zip: "10001"
          },
          location: {
            type: "Point",
            coordinates: [-73.935242, 40.730610] // NYC
          },
          stock: {
            'A+': 10, 'A-': 5, 'B+': 8, 'B-': 3, 'AB+': 4, 'AB-': 2, 'O+': 15, 'O-': 6
          }
        },
        {
          name: "Red Cross Donation Center",
          email: "center@redcross.example.com",
          phone: "555-0102",
          address: {
            street: "456 Community Ln",
            city: "Metropolis",
            state: "NY",
            zip: "10002"
          },
          location: {
            type: "Point",
            coordinates: [-74.0060, 40.7128] // NYC
          },
          stock: {
            'A+': 20, 'A-': 10, 'B+': 15, 'B-': 5, 'AB+': 5, 'AB-': 5, 'O+': 30, 'O-': 10
          }
        },
        {
          name: "Valley Life Blood Center",
          email: "contact@valleylife.com",
          phone: "555-0103",
          address: {
            street: "789 River Rd",
            city: "Smallville",
            state: "KS",
            zip: "66002"
          },
          location: {
            type: "Point",
            coordinates: [-95.6894, 39.0997] // Kansas
          },
          stock: {
            'A+': 5, 'A-': 2, 'B+': 5, 'B-': 2, 'AB+': 1, 'AB-': 0, 'O+': 10, 'O-': 4
          }
        }
      ];
      await BloodBank.create(sampleBanks);
      bankMessage = "Seeded blood banks successfully";
    }

    // Seed Admin User
    const adminExists = await User.findOne({ email: "admin@example.com" });
    let adminMessage = "Admin user already exists";

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "System Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        bloodGroup: "O+", // Admins can be donors too
        address: "System HQ",
        phone: "000-000-0000",
        isVerified: true
      });
      adminMessage = "Created admin user (admin@example.com / admin123)";
    }

    return NextResponse.json({ 
      message: "Seed operation completed", 
      details: { banks: bankMessage, admin: adminMessage } 
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
  }
}
