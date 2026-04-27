/*import express from 'express';
import { Book } from '../models/book.js'

export const bookRouter = express.Router();

bookRouter.post('/books', (req, res) => {

  let isbnFound: boolean = false;

  /*
  Book.findOne({isbn: req.body.isbn}).then((copy) => {
    res.status(401).send('YA existe un libro con ese isbn')
    isbnFound = true;
  });*/  /*

  if (isbnFound == false) {
    const book = new Book(req.body);

    book.save().then((book) => {
        res.status(201).send(book);
    }).catch((error) => {
        res.status(500).send(error);
    });
  }
});

bookRouter.get('/books', (req, res) => {
  const filter = req.query.genre?{genre: req.query.genre.toString()}:{};

  if (filter == null) {  // Si no se uso genre en la query, se busca si se usó author
    const filter = req.query.author?{genre: req.query.author.toString()}:{};
  }

  Book.find(filter).then((books) => {
    if (books.length !== 0) {
      res.send(books);
    } else {
      res.status(404).send();
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

bookRouter.get('/books/:id', (req, res) => {
    
  Book.findById(req.params.id).then((book) => {
    if (!book) {
      return res.status(404).send();
    }
    return res.send(book);
  }).catch((error) => {
    return res.status(500).send();
  });
});

bookRouter.delete('/books/:id', (req, res) => {
  Book.findByIdAndDelete(req.params.id).then((book) => {
    if (!book) {
      return res.status(404).send();
    }

    return res.send(book);
  }).catch((error) => {
    return res.status(400).send();
  });
});


bookRouter.patch('/books/:id', (req, res) => {
  if (!req.params.id) {
    res.status(400).send({
      error: 'An id must be provided',
    });
  } else if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  } else {
    const allowedUpdates = ['title', 'author', 'genre', 'Biography', 'year', 'pages', 'avialble', 'rating'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).then((book) => {
        if (!book) {
          res.status(404).send();
        } else {
          res.send(book);
        }
      }).catch((error) => {
        res.status(500).send(error);
      });
    }
  }
});*/