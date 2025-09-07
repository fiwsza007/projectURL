// In-memory database for URL shortener
class Database {
  constructor() {
    this.users = [];
    this.links = [];
    this.nextUserId = 1;
    this.nextId = 1;
  }

  // User management
  createUser(data) {
    const newUser = {
      id: this.nextUserId++,
      email: data.email,
      name: data.name,
      password: data.password, // This will be hashed
      createdAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  getUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  getUserById(id) {
    return this.users.find(user => user.id === parseInt(id));
  }

  // Create a new shortened link
  createLink(data) {
    const newLink = {
      id: this.nextId++,
      userId: data.userId,
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt || null,
      clickCount: 0,
      isActive: true
    };
    
    this.links.push(newLink);
    return newLink;
  }

  // Get all links for a specific user
  getAllLinks(userId) {
    return this.links
      .filter(link => link.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get link by short code
  getLinkByShortCode(shortCode) {
    return this.links.find(link => link.shortCode === shortCode);
  }

  // Get link by ID
  getLinkById(id) {
    return this.links.find(link => link.id === parseInt(id));
  }

  // Get link by ID and user ID (for authorization)
  getLinkByIdAndUser(id, userId) {
    return this.links.find(link => link.id === parseInt(id) && link.userId === userId);
  }

  // Update link
  updateLink(id, userId, updates) {
    const linkIndex = this.links.findIndex(link => link.id === parseInt(id) && link.userId === userId);
    if (linkIndex !== -1) {
      this.links[linkIndex] = { ...this.links[linkIndex], ...updates };
      return this.links[linkIndex];
    }
    return null;
  }

  // Delete link
  deleteLink(id, userId) {
    const linkIndex = this.links.findIndex(link => link.id === parseInt(id) && link.userId === userId);
    if (linkIndex !== -1) {
      return this.links.splice(linkIndex, 1)[0];
    }
    return null;
  }

  // Increment click count
  incrementClickCount(id) {
    const link = this.getLinkById(id);
    if (link) {
      link.clickCount++;
      return link;
    }
    return null;
  }

  // Check if short code exists
  shortCodeExists(shortCode, userId = null) {
    if (userId) {
      return this.links.some(link => link.shortCode === shortCode && link.userId === userId);
    }
    return this.links.some(link => link.shortCode === shortCode);
  }

  // Check if link is valid and active
  isLinkValid(link) {
    if (!link || !link.isActive) return false;
    
    if (link.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(link.expiresAt);
      return now < expiryDate;
    }
    
    return true;
  }
}

export default new Database();