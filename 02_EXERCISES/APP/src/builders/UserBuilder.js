// User Builder
import User from "../models/User.js";

export default class UserBuilder {
  constructor() {
    this.user = {};
  }

  setName(name) {
    this.user.name = name;
    return this;
  }

  setEmail(email) {
    this.user.email = email;
    return this;
  }

  setRole(role) {
    this.user.role = role;
    return this;
  }

  setActive(active) {
    this.user.active = active;
    return this;
  }

  build() {
    return new User(this.user);
  }
}