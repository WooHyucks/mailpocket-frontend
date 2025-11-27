const PageLoding = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-6 px-4'>
      <div className='flex flex-col items-center gap-6 animate-fadeIn'>
        {/* Symbol with enhanced animation */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-br from-customPurple/20 to-purple-200/20 rounded-full blur-xl animate-pulse'></div>
          <img 
            className='w-[80px] md:w-[70px] relative z-10 animate-loding drop-shadow-lg' 
            src="/images/MailpocketSymbol.png" 
            alt="MailpocketSymbol" 
          />
        </div>
        
        {/* Logo */}
        <img 
          className='w-[200px] md:w-[150px] opacity-90 transition-opacity duration-300' 
          src="/images/MailpocketLogo.png" 
          alt="MailpocketLogo" 
        />
        
        {/* Loading text with dots animation */}
        <div className='flex flex-col items-center gap-3 mt-2'>
          <p className='font-bold text-xl md:text-lg text-gray-700'>
            Loading
          </p>
          <div className='flex gap-2 mt-3'>
            <div className='w-2 h-2 bg-customPurple rounded-full animate-bounce [animation-delay:0ms]'></div>
            <div className='w-2 h-2 bg-customPurple rounded-full animate-bounce [animation-delay:150ms]'></div>
            <div className='w-2 h-2 bg-customPurple rounded-full animate-bounce [animation-delay:300ms]'></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageLoding