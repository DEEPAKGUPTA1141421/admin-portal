export const INDIAN_CITIES: { city: string; state: string }[] = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Mysuru", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Surat", state: "Gujarat" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Kanpur", state: "Uttar Pradesh" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Gurugram", state: "Haryana" },
  { city: "Chandigarh", state: "Chandigarh" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Patna", state: "Bihar" },
  { city: "Kochi", state: "Kerala" },
  { city: "Thiruvananthapuram", state: "Kerala" },
  { city: "Bhubaneswar", state: "Odisha" },
  { city: "Guwahati", state: "Assam" },
];

export const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra",
  "Pari", "Anika", "Navya", "Riya", "Rahul", "Priya", "Neha", "Pooja",
  "Amit", "Sneha", "Vikram", "Kavya", "Rajesh", "Sunita",
];

export const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Nair",
  "Iyer", "Rao", "Mehta", "Joshi", "Agarwal", "Malhotra", "Chopra", "Bose",
  "Das", "Pillai", "Menon", "Kulkarni",
];

export const CATEGORIES = [
  "Mobiles & Accessories",
  "Electronics",
  "Fashion - Men",
  "Fashion - Women",
  "Fashion - Kids",
  "Home & Kitchen",
  "Furniture",
  "Appliances",
  "Beauty & Personal Care",
  "Grocery",
  "Toys & Baby Products",
  "Sports & Fitness",
  "Books & Stationery",
  "Automotive",
  "Health & Wellness",
  "Jewellery & Watches",
  "Bags & Luggage",
  "Footwear",
];

export const BRANDS = [
  "Samsung", "Apple", "OnePlus", "Xiaomi", "boAt", "Noise", "HP", "Dell",
  "Lenovo", "Sony", "LG", "Whirlpool", "Bajaj", "Prestige", "Philips",
  "Nike", "Adidas", "Puma", "Levi's", "Allen Solly", "Van Heusen",
  "FabIndia", "Titan", "Fastrack", "Fossil", "Mamaearth", "Nivea",
  "Lakme", "Himalaya", "Tata", "Godrej",
];

export const PRODUCT_NOUNS = [
  "Wireless Earbuds", "Smartwatch", "Bluetooth Speaker", "Laptop Backpack",
  "Cotton T-Shirt", "Running Shoes", "Formal Shirt", "Denim Jeans",
  "Air Fryer", "Mixer Grinder", "Ceiling Fan", "LED TV 43-inch",
  "Refrigerator 250L", "Washing Machine", "Face Wash", "Moisturizer",
  "Trimmer", "Power Bank 20000mAh", "USB-C Cable", "Yoga Mat",
  "Office Chair", "Study Table", "Sofa Set", "Bedsheet Set",
  "Kids Storybook Set", "Analog Wristwatch", "Sunglasses", "Leather Wallet",
  "Handbag", "Kurta Set", "Saree", "Track Pants", "Wireless Mouse",
  "Mechanical Keyboard", "Gaming Headset", "Water Bottle", "Pressure Cooker",
];

export const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "COD", "Wallet"];
export const GATEWAYS = ["Razorpay", "PayU", "Cashfree", "Paytm"];
export const CARRIERS = ["Delhivery", "Ekart", "Bluedart", "DTDC", "Xpressbees", "In-house Fleet"];
export const RETURN_REASONS = [
  "Damaged", "Wrong product", "Missing item", "Defective", "Size issue",
  "Quality issue", "Customer changed mind", "Other",
];
export const BUSINESS_TYPES = ["Proprietorship", "Partnership", "Private Limited", "LLP"];

export function fullName(): string {
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${
    LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  }`;
}

export function indianPhone(seedNum: number): string {
  return `9${String(100000000 + (seedNum * 7919) % 899999999).slice(0, 9)}`;
}
