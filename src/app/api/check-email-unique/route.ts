import dbConnect from "@/lib/dbConnect";
import { emailValidation } from "@/schemas/signUpSchema";
import { z } from "zod";
import UserModel from "@/model/User";

const EmailQuerySchema = z.object({
  email: emailValidation,
});
export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);

  const queryParamsEmail = {
    email: searchParams.get("email"),
  };
  try {
    const result = EmailQuerySchema.safeParse(queryParamsEmail);

    if (!result.success) {
      const emailErrors = result.error.format().email?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            emailErrors?.length > 0
              ? emailErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      email,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Email is already taken",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Email is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking email:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking email",
      },
      { status: 500 }
    );
  }
}
