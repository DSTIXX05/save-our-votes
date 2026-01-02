import mongoose, { Document, Types } from 'mongoose';

export interface IOption {
  _id?: Types.ObjectId;
  text: string;
  order: number;
}

export interface IBallot {
  election?: string;
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  type: 'single' | 'multiple';
  maxSelections: number;
  options: IOption[];
  isActive: boolean;
}

export interface IElection extends Document {
  title: string;
  slug: string;
  description?: string;
  organizer: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  status: 'draft' | 'scheduled' | 'open' | 'closed';
  ballots: IBallot[];
  createdAt: Date;
  updatedAt: Date;
}
