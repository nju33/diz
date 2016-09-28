import xml from 'xml';

export default class AtomFeed {
  constructor({id, title, description, link, updated, author}) {
    this.id = id;
    this.title = title;
    this.descripton = description;
    this.link = this.link;
    this.updated = this.updated || new Date();
    this.author = this.author;
    this.generator = 'diz atom feed';
  }

  addEntry({id, title, link, summary, pubDate}) {
    // TODO:
  }
}
