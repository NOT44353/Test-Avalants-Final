import { dataStore } from '../models/DataStore';
import { Node, Order, Product, User } from '../types';

/**
 * Seed script for generating test data
 * Uses fixed random seed for deterministic results
 */

// Fixed seed for deterministic results
const RANDOM_SEED = 12345;

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

const rng = new SeededRandom(RANDOM_SEED);

// Sample data for realistic generation
const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
  'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald',
  'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol', 'Joshua',
  'Ruth', 'Kenneth', 'Sharon', 'Kevin', 'Michelle', 'Brian', 'Laura', 'George',
  'Sarah', 'Timothy', 'Kimberly', 'Ronald', 'Deborah', 'Jason', 'Dorothy'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const PRODUCT_NAMES = [
  'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Camera', 'Watch', 'Speaker',
  'Keyboard', 'Mouse', 'Monitor', 'Charger', 'Case', 'Screen Protector', 'Cable',
  'Adapter', 'Stand', 'Bag', 'Sticker', 'Skin', 'Grip', 'Mount', 'Tripod',
  'Lens', 'Memory Card', 'Battery', 'Power Bank', 'Bluetooth', 'USB Hub',
  'Webcam', 'Microphone', 'Printer', 'Scanner', 'Router', 'Modem', 'Switch'
];

const PRODUCT_CATEGORIES = [
  'Electronics', 'Computers', 'Mobile', 'Audio', 'Photography', 'Wearables',
  'Accessories', 'Gaming', 'Office', 'Home', 'Travel', 'Sports', 'Health'
];

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  const domain = rng.choice(domains);
  const number = rng.nextInt(1, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@${domain}`;
}

function generateProductName(): string {
  const base = rng.choice(PRODUCT_NAMES);
  const category = rng.choice(PRODUCT_CATEGORIES);
  const model = rng.nextInt(1000, 9999);
  return `${base} ${category} ${model}`;
}

function generatePrice(): number {
  return Math.round(rng.nextFloat(10, 2000) * 100) / 100;
}

function generateNodeName(depth: number): string {
  const prefixes = ['Department', 'Division', 'Team', 'Group', 'Unit', 'Section'];
  const suffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  if (depth === 0) {
    return rng.choice(['Company', 'Organization', 'Corporation', 'Enterprise']);
  }

  const prefix = rng.choice(prefixes);
  const suffix = rng.choice(suffixes);
  const number = rng.nextInt(1, 99);
  return `${prefix} ${suffix}${number}`;
}

export async function seedUsers(count: number): Promise<number> {
  console.log(`Generating ${count} users...`);

  for (let i = 1; i <= count; i++) {
    const firstName = rng.choice(FIRST_NAMES);
    const lastName = rng.choice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName);
    const createdAt = new Date(2020 + rng.nextInt(0, 4), rng.nextInt(0, 11), rng.nextInt(1, 28)).toISOString();

    const user: User = {
      id: i,
      name,
      email,
      createdAt
    };

    dataStore.addUser(user);
  }

  console.log(`Generated ${count} users`);
  return count;
}

export async function seedProducts(count: number): Promise<number> {
  console.log(`Generating ${count} products...`);

  for (let i = 1; i <= count; i++) {
    const name = generateProductName();
    const price = generatePrice();

    const product: Product = {
      id: i,
      name,
      price
    };

    dataStore.addProduct(product);
  }

  console.log(`Generated ${count} products`);
  return count;
}

export async function seedOrders(count: number, userCount: number, productCount: number): Promise<number> {
  console.log(`Generating ${count} orders...`);

  for (let i = 1; i <= count; i++) {
    const userId = rng.nextInt(1, userCount);
    const productId = rng.nextInt(1, productCount);
    const product = dataStore.getProduct(productId);
    const basePrice = product ? product.price : rng.nextFloat(10, 1000);
    const amount = Math.round(basePrice * rng.nextFloat(0.5, 3.0) * 100) / 100;
    const createdAt = new Date(2020 + rng.nextInt(0, 4), rng.nextInt(0, 11), rng.nextInt(1, 28)).toISOString();

    const order: Order = {
      id: i,
      userId,
      productId,
      amount,
      createdAt
    };

    dataStore.addOrder(order);
  }

  console.log(`Generated ${count} orders`);
  return count;
}

export async function seedNodes(breadth: number, depth: number): Promise<number> {
  console.log(`Generating tree with breadth=${breadth}, depth=${depth}...`);

  let nodeId = 1;
  const maxNodes = Math.min(breadth ** depth, 10000); // Cap at 10k nodes

  // Generate root nodes
  const rootNodes: string[] = [];
  for (let i = 0; i < breadth && nodeId <= maxNodes; i++) {
    const node: Node = {
      id: nodeId.toString(),
      parentId: null,
      name: generateNodeName(0),
      hasChildren: depth > 1
    };

    dataStore.addNode(node);
    rootNodes.push(nodeId.toString());
    nodeId++;
  }

  // Generate child nodes level by level
  let currentLevel = rootNodes;
  for (let level = 1; level < depth && nodeId <= maxNodes; level++) {
    const nextLevel: string[] = [];

    for (const parentId of currentLevel) {
      const childrenCount = rng.nextInt(1, breadth);

      for (let i = 0; i < childrenCount && nodeId <= maxNodes; i++) {
        const isLastLevel = level === depth - 1;
        const node: Node = {
          id: nodeId.toString(),
          parentId,
          name: generateNodeName(level),
          hasChildren: !isLastLevel
        };

        dataStore.addNode(node);
        nextLevel.push(nodeId.toString());
        nodeId++;
      }
    }

    currentLevel = nextLevel;
  }

  console.log(`Generated ${nodeId - 1} nodes`);
  return nodeId - 1;
}

export async function seedQuotes(symbols: string[]): Promise<void> {
  console.log(`Generating quotes for ${symbols.length} symbols...`);

  for (const symbol of symbols) {
    const basePrice = rng.nextFloat(10, 1000);
    dataStore.updateQuote(symbol, Math.round(basePrice * 100) / 100);
  }

  console.log(`Generated quotes for ${symbols.length} symbols`);
}

export async function clearData(): Promise<void> {
  console.log('Clearing all data...');
  dataStore.clear();
  console.log('Data cleared');
}

// Main seed function
export async function seedData(config: {
  users?: number;
  orders?: number;
  products?: number;
  breadth?: number;
  depth?: number;
  symbols?: string[];
}): Promise<{
  users: number;
  products: number;
  orders: number;
  nodes: number;
  quotes: number;
}> {
  console.log('Starting data seeding...');

  // Clear existing data
  await clearData();

  const results = {
    users: 0,
    products: 0,
    orders: 0,
    nodes: 0,
    quotes: 0
  };

  // Seed users, products, orders (Challenge 1)
  if (config.users) {
    results.users = await seedUsers(config.users);
  }

  if (config.products) {
    results.products = await seedProducts(config.products);
  }

  if (config.orders && config.users && config.products) {
    results.orders = await seedOrders(config.orders, config.users, config.products);
  }

  // Seed nodes (Challenge 2)
  if (config.breadth && config.depth) {
    results.nodes = await seedNodes(config.breadth, config.depth);
  }

  // Seed quotes (Challenge 3)
  if (config.symbols) {
    await seedQuotes(config.symbols);
    results.quotes = config.symbols.length;
  }

  console.log('Data seeding completed:', results);
  return results;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: any = {};

  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (key && value) {
      config[key] = parseInt(value, 10);
    }
  }

  // Default values
  const defaultConfig = {
    users: 50000,
    orders: 500000,
    products: 10000,
    breadth: 20,
    depth: 10,
    symbols: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC']
  };

  const finalConfig = { ...defaultConfig, ...config };

  seedData(finalConfig)
    .then((results) => {
      console.log('Seeding completed successfully:', results);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

