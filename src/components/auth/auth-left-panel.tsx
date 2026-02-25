const imgBackground = 'https://www.figma.com/api/mcp/asset/6273ede7-6528-45ee-8040-41056a10f4d2'
const imgOverlay = 'https://www.figma.com/api/mcp/asset/42be83a4-7631-4080-b0a7-ea00fffcc61d'
const imgDashboard = 'https://www.figma.com/api/mcp/asset/9202399d-fb49-47e1-9061-417e4eafe18a'

export default function AuthLeftPanel() {
  return (
    <div className="absolute left-8 top-8 h-[calc(100vh-64px)] max-h-[960px] w-[691px] rounded-3xl overflow-hidden hidden lg:block">
      {/* Background */}
      <div className="absolute inset-0 bg-[#c8f0d5]" />
      <img src={imgBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <img src={imgOverlay} alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* Heading */}
      <div className="absolute left-12 top-12 w-[584px] text-[#07472e]">
        <p className="font-medium text-[56px] leading-tight tracking-[-1.68px]">Hi there!</p>
        <p className="mt-1 text-2xl leading-relaxed tracking-[-0.24px]">
          Manage your entire HR department in one place — streamline policies, processes,
          and people operations with ease.
        </p>
      </div>

      {/* Dashboard preview */}
      <div className="absolute left-12 right-0 top-[292px] bottom-[49px] rounded-3xl overflow-hidden">
        <img src={imgDashboard} alt="Dashboard preview" className="w-full h-full object-cover object-left" />
      </div>
    </div>
  )
}
