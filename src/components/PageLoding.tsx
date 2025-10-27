const PageLoding = () => {
  return (
    <div className='mt-10 flex flex-col items-center justify-center gap-3'>
      <img className='w-[70px] animate-loding' src="/images/MailpocketSymbol.png" alt="MailpocketSymbol" />
      <img className='w-[150px]' src="/images/MailpocketLogo.png" alt="MailpocketLogo" />
      <p className='font-bold  mt-4 text-xl'>Loding...</p>
    </div>
  )
}

export default PageLoding