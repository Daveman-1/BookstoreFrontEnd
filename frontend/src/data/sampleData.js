// Sample data for the bookstore application
export const sampleItems = [
  {
    id: 1,
    name: "Mathematics Textbook - Grade 10",
    category: "Books",
    description: "Comprehensive mathematics textbook for Grade 10 students covering algebra, geometry, and trigonometry.",
    price: 45.00,
    stock: 25,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 2,
    name: "English Literature - Shakespeare Collection",
    category: "Books",
    description: "Complete works of William Shakespeare including Romeo and Juliet, Hamlet, and Macbeth.",
    price: 35.50,
    stock: 15,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 3,
    name: "Science Lab Notebook - A4",
    category: "Stationery",
    description: "High-quality laboratory notebook with graph paper, perfect for science experiments and data recording.",
    price: 12.00,
    stock: 50,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 4,
    name: "Blue Ink Pens - Pack of 10",
    category: "Stationery",
    description: "Smooth writing blue ink pens, pack of 10 pieces. Perfect for daily use in school and office.",
    price: 8.50,
    stock: 100,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 5,
    name: "School Uniform - Boys",
    category: "Uniforms",
    description: "Standard school uniform for boys including shirt and trousers. Available in various sizes.",
    price: 65.00,
    stock: 30,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 6,
    name: "School Uniform - Girls",
    category: "Uniforms",
    description: "Standard school uniform for girls including blouse and skirt. Available in various sizes.",
    price: 60.00,
    stock: 28,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 7,
    name: "Scientific Calculator",
    category: "Electronics",
    description: "Advanced scientific calculator with 300+ functions. Perfect for mathematics and science students.",
    price: 85.00,
    stock: 12,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 8,
    name: "History Textbook - World History",
    category: "Books",
    description: "Comprehensive world history textbook covering ancient civilizations to modern times.",
    price: 42.00,
    stock: 20,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 9,
    name: "Pencil Set - HB, 2B, 4B",
    category: "Stationery",
    description: "Professional pencil set including HB, 2B, and 4B pencils. Ideal for drawing and sketching.",
    price: 15.00,
    stock: 75,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 10,
    name: "School Bag - Backpack",
    category: "Other",
    description: "Durable school backpack with multiple compartments. Water-resistant material.",
    price: 55.00,
    stock: 18,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 11,
    name: "Physics Textbook - Advanced Level",
    category: "Books",
    description: "Advanced physics textbook covering mechanics, thermodynamics, and quantum physics.",
    price: 55.00,
    stock: 8,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 12,
    name: "Ruler Set - 30cm",
    category: "Stationery",
    description: "Precision ruler set with 30cm length. Made from durable plastic material.",
    price: 6.50,
    stock: 45,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 13,
    name: "Computer Science Textbook",
    category: "Books",
    description: "Introduction to computer science covering programming fundamentals and algorithms.",
    price: 48.00,
    stock: 15,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 14,
    name: "USB Flash Drive - 32GB",
    category: "Electronics",
    description: "High-speed USB 3.0 flash drive with 32GB storage capacity. Perfect for students.",
    price: 25.00,
    stock: 22,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 15,
    name: "Art Supplies Kit",
    category: "Other",
    description: "Complete art supplies kit including paints, brushes, and canvas. For creative students.",
    price: 75.00,
    stock: 10,
    image: null,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

export const sampleSales = [
  {
    id: 1,
    items: [
      { itemId: 1, name: "Mathematics Textbook - Grade 10", price: 45.00, quantity: 1 },
      { itemId: 4, name: "Blue Ink Pens - Pack of 10", price: 8.50, quantity: 2 }
    ],
    total: 62.00,
    paymentMethod: "cash",
    date: "2024-01-20T09:30:00.000Z"
  },
  {
    id: 2,
    items: [
      { itemId: 7, name: "Scientific Calculator", price: 85.00, quantity: 1 },
      { itemId: 3, name: "Science Lab Notebook - A4", price: 12.00, quantity: 3 }
    ],
    total: 121.00,
    paymentMethod: "card",
    date: "2024-01-20T11:15:00.000Z"
  },
  {
    id: 3,
    items: [
      { itemId: 5, name: "School Uniform - Boys", price: 65.00, quantity: 1 },
      { itemId: 10, name: "School Bag - Backpack", price: 55.00, quantity: 1 }
    ],
    total: 120.00,
    paymentMethod: "mobile_money",
    date: "2024-01-20T14:45:00.000Z"
  },
  {
    id: 4,
    items: [
      { itemId: 2, name: "English Literature - Shakespeare Collection", price: 35.50, quantity: 1 },
      { itemId: 9, name: "Pencil Set - HB, 2B, 4B", price: 15.00, quantity: 1 }
    ],
    total: 50.50,
    paymentMethod: "cash",
    date: "2024-01-20T16:20:00.000Z"
  },
  {
    id: 5,
    items: [
      { itemId: 8, name: "History Textbook - World History", price: 42.00, quantity: 1 },
      { itemId: 12, name: "Ruler Set - 30cm", price: 6.50, quantity: 2 }
    ],
    total: 55.00,
    paymentMethod: "card",
    date: "2024-01-20T17:30:00.000Z"
  }
]; 