import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IFeeCategory extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeCategorySchema =
  new Schema<IFeeCategory>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },

      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 30,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    },
  );

/**
 * Fee category names and codes should be unique.
 */
feeCategorySchema.index(
  { name: 1 },
  { unique: true },
);

feeCategorySchema.index(
  { code: 1 },
  { unique: true },
);

/**
 * Useful for filtering active categories.
 */
feeCategorySchema.index({
  isActive: 1,
});

const FeeCategory =
  mongoose.models.FeeCategory ||
  mongoose.model<IFeeCategory>(
    "FeeCategory",
    feeCategorySchema,
  );

export default FeeCategory;