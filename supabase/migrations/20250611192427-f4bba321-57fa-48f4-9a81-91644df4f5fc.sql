
-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE public.proposal_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');
CREATE TYPE public.price_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.notification_type AS ENUM ('order', 'product', 'system', 'compliance', 'payment');
CREATE TYPE public.user_role AS ENUM ('admin', 'supplier');
CREATE TYPE public.document_type AS ENUM ('certificate', 'invoice', 'compliance', 'shipping', 'other');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'supplier',
  company_name TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product proposals table
CREATE TABLE public.product_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  proposed_price DECIMAL(10,2) NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  status public.proposal_status DEFAULT 'pending',
  woocommerce_product_id INTEGER, -- Link to WooCommerce product if approved
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price update requests table
CREATE TABLE public.price_update_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  woocommerce_product_id INTEGER NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  requested_price DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status public.price_request_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type public.notification_type NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB, -- Additional structured data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance documents table
CREATE TABLE public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type public.document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  expiry_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT, -- e.g., 'order', 'product', 'proposal'
  entity_id TEXT, -- Could be UUID or integer depending on entity
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "New users can insert their profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for product_proposals table
CREATE POLICY "Suppliers can view their own proposals" ON public.product_proposals
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Admins can view all proposals" ON public.product_proposals
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Suppliers can create proposals" ON public.product_proposals
  FOR INSERT WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Suppliers can update their own proposals" ON public.product_proposals
  FOR UPDATE USING (supplier_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can update all proposals" ON public.product_proposals
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for price_update_requests table
CREATE POLICY "Suppliers can view their own price requests" ON public.price_update_requests
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Admins can view all price requests" ON public.price_update_requests
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Suppliers can create price requests" ON public.price_update_requests
  FOR INSERT WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Suppliers can update their own pending requests" ON public.price_update_requests
  FOR UPDATE USING (supplier_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can update all price requests" ON public.price_update_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications for any user

-- RLS Policies for compliance_documents table
CREATE POLICY "Suppliers can view their own documents" ON public.compliance_documents
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Admins can view all documents" ON public.compliance_documents
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Suppliers can upload documents" ON public.compliance_documents
  FOR INSERT WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Suppliers can update their own documents" ON public.compliance_documents
  FOR UPDATE USING (supplier_id = auth.uid() AND verified = FALSE);

CREATE POLICY "Admins can update all documents" ON public.compliance_documents
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for user_activity_logs table
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can create activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (true); -- Allow system to log activities

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'supplier')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_product_proposals_updated_at
  BEFORE UPDATE ON public.product_proposals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_price_update_requests_updated_at
  BEFORE UPDATE ON public.price_update_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_compliance_documents_updated_at
  BEFORE UPDATE ON public.compliance_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_product_proposals_supplier_id ON public.product_proposals(supplier_id);
CREATE INDEX idx_product_proposals_status ON public.product_proposals(status);
CREATE INDEX idx_price_update_requests_supplier_id ON public.price_update_requests(supplier_id);
CREATE INDEX idx_price_update_requests_status ON public.price_update_requests(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_compliance_documents_supplier_id ON public.compliance_documents(supplier_id);
CREATE INDEX idx_compliance_documents_type ON public.compliance_documents(document_type);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
