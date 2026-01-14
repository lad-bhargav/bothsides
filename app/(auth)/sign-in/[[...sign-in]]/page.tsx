import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return(
     <div className='h-screen w-screen flex justify-center items-center'>
        <SignIn 
          appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
            card: 'shadow-lg !bg-[#4A249D]',
            headerTitle: 'text-2xl font-bold',
            formFieldInput: 'rounded-lg border-gray-300',
          }
        }}
       />
     </div>
  ); 
}