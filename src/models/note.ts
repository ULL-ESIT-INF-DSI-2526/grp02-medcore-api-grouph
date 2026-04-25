import {Document, Schema, model} from 'mongoose';

interface NoteInterface extends Document {
  title: string,
  body: string,
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'magenta'
}

const NoteSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Note title must start with a capital letter');
      }
    },
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    default: 'yellow',
    trim: true,
    enum: ['blue', 'green', 'red', 'yellow', 'magenta'],
  },
});

export const Note = model<NoteInterface>('Note', NoteSchema);
