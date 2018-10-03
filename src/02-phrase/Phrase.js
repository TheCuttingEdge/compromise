class Phrase {
  constructor(id, length, pool) {
    this.start = id;
    this.length = length;
    Object.defineProperty(this, 'pool', {
      enumerable: false,
      writable: true,
      value: pool
    });
  }
  terms() {
    let terms = [this.pool.get(this.start)];
    if (this.length === 0) {
      return [];
    }
    for(let i = 0; i < this.length - 1; i += 1) {
      let id = terms[terms.length - 1].next;
      if (id === null) {
        console.warn('linked-list broken');
        break;
      }
      let term = this.pool.get(id);
      terms.push(term);
    }
    return terms;
  }
  append(phrase) {
    let terms = this.terms();
    //add the start of this phrase, to the end of our phrase
    terms[terms.length - 1].next = phrase.start;
    //hook it up backwards, too
    phrase.terms()[0].prev = terms[terms.length - 1].id;
    //include it in our phrase
    this.length += phrase.length;
    return this;
  }
  prepend(phrase) {
    let newTerms = phrase.terms();
    //add us to the end of new phrase
    newTerms[newTerms.length - 1].next = this.start;
    //hoot it up backwards, too
    this.terms()[0].prev = newTerms[0].id;
    //include it in our phrase
    this.start = newTerms[0].id;
    this.length += phrase.length;
    return this;
  }
  text( options = {} ) {
    return this.terms().reduce((str, t) => {
      return str + t.toText(options);
    }, '');
  }
  normal() {
    return this.terms().map((t) => t.normal).join(' ');
  }
  json( options = {} ) {
    let out = {};
    out.text = this.text();
    out.normal = this.normal();
    if (options.terms !== false) {
      out.terms = this.terms().map((t) => t.json(options));
    }
    return out;
  }
}
//  ¯\_(:/)_/¯
Phrase.prototype.clone = function() { //how do we clone part of the pool?
  let terms = this.terms();
  let newTerms = terms.map((t) => t.clone());
  //connect these new ids up
  newTerms.forEach((t, i) => {
    //add it to the pool..
    this.pool.add(t);
    if (newTerms[i + 1]) {
      t.next = newTerms[i + 1].id;
    }
    if (newTerms[i - 1]) {
      t.prev = newTerms[i - 1].id;
    }
  });
  return new Phrase(newTerms[0].id, newTerms.length, this.pool);
};

Phrase.prototype.match = function(str) {
  let matches = [];
  let terms = this.terms();
  for(let i = 0; i < terms.length; i += 1) {
    if (typeof str === 'string' && terms[i].normal === str) {
      matches.push([terms[i]]);
    } else if (str.includes(terms[i].normal)) {
      matches.push([terms[i]]);
    }
  }
  //make them phrase objects
  matches = matches.map((list) => {
    return new Phrase(list[0].id, list.length, this.pool);
  });
  return matches;
};
module.exports = Phrase;