import AuthLeftPanel from '@/components/auth/auth-left-panel'
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="bg-[#fbfff3]">
      <div className="relative min-h-screen bg-[#fbfff3] flex items-center justify-end max-w-[1440px] mx-auto">
        <AuthLeftPanel />
        <div className="w-full lg:w-[717px] flex items-center justify-center px-8 py-16 min-h-screen">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
