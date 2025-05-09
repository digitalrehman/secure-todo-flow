
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authService, { 
  User, 
  LoginCredentials, 
  RegisterCredentials,
  VerificationRequest,
  PhoneVerificationRequest
} from "../services/authService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  verificationSent: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  verificationSent: false
};

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.register(userData);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async () => {
    authService.logout();
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch user");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (verificationData: VerificationRequest, { rejectWithValue }) => {
    try {
      await authService.verifyEmail(verificationData);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Verification failed");
    }
  }
);

export const sendVerificationEmail = createAsyncThunk(
  "auth/sendVerificationEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.sendVerificationEmail(email);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send verification");
    }
  }
);

export const sendPhoneVerification = createAsyncThunk(
  "auth/sendPhoneVerification",
  async ({ phoneNumber, userId }: { phoneNumber: string, userId?: string }, { rejectWithValue }) => {
    try {
      const code = await authService.sendPhoneVerification(phoneNumber, userId);
      return code;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send verification");
    }
  }
);

export const verifyPhoneNumber = createAsyncThunk(
  "auth/verifyPhoneNumber",
  async (verificationData: PhoneVerificationRequest, { rejectWithValue }) => {
    try {
      const user = await authService.verifyPhoneNumber(verificationData);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Phone verification failed");
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      await authService.googleLogin();
      // This function redirects to Google auth so it doesn't return a user directly
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Google login failed");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout case
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      // Verify email cases
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send verification email cases
      .addCase(sendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationSent = false;
      })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        state.loading = false;
        state.verificationSent = true;
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.verificationSent = false;
      })
      // Send phone verification cases
      .addCase(sendPhoneVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationSent = false;
      })
      .addCase(sendPhoneVerification.fulfilled, (state) => {
        state.loading = false;
        state.verificationSent = true;
      })
      .addCase(sendPhoneVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.verificationSent = false;
      })
      // Verify phone cases
      .addCase(verifyPhoneNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPhoneNumber.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(verifyPhoneNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google login cases
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state) => {
        state.loading = false;
        // We don't set user or isAuthenticated here because googleLogin redirects to Google
        // User will be set after redirecting back via fetchCurrentUser
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthError } = authSlice.actions;
export default authSlice.reducer;
