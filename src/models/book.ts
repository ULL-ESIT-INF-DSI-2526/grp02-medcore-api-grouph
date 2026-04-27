/*import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

export interface BookDocument extends Document {
  title: string;
  author: string;
  genre: 'Fiction' | 'Non-Fiction' | 'Science' | 'History' | 'Fantasy' | 'Biography';
  year: number;
  isbn: string;
  pages: number;
  available: boolean;
  rating: number;
}

const BookSchema = new Schema<BookDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Fantasy', 'Biography']
  },
  year: {
    type: Number,
    validate(value: number) {
      if (1000 < value && value < 2027) {
        throw new Error('El año debe sr entre 1000 y el actual');
      }
    }
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    validate: (value: string) => {
      if (value.length != 13) {
        throw new Error('Número de dígitos del isbn no valido')
      }
    }
  },
  pages: {
    type: Number,
    validate(value: number) {
      if (value < 0) {
        throw new Error('El número de página sno puede ser negativo')
      }
    }
  },
  available: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    validate(value: number) {
      if (value < 0 && value > 5) {
        throw new Error('El rating tiene qu eestar entre 0 y 5')
      }
    }
  }
});

export const Book = model<BookDocument>('Book', BookSchema);*/