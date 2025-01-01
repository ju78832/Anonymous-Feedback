import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { emailValidation, usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

const EmailQuerySchema = z.object({
  email: emailValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const queryParamsUsername = {
    username: searchParams.get("username"),
  };

  const queryParamsEmail = {
    email: searchParams.get("email"),
  };

  if (queryParamsUsername) {
    try {
      const result = UsernameQuerySchema.safeParse(queryParamsUsername);

      if (!result.success) {
        const usernameErrors = result.error.format().username?._errors || [];
        return Response.json(
          {
            success: false,
            message:
              usernameErrors?.length > 0
                ? usernameErrors.join(", ")
                : "Invalid query parameters",
          },
          { status: 400 }
        );
      }

      const { username } = result.data;

      const existingVerifiedUser = await UserModel.findOne({
        username,
        isVerified: true,
      });

      if (existingVerifiedUser) {
        return Response.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 200 }
        );
      }

      return Response.json(
        {
          success: true,
          message: "Username is unique",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error checking username:", error);
      return Response.json(
        {
          success: false,
          message: "Error checking username",
        },
        { status: 500 }
      );
    }
  } else {
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
}
