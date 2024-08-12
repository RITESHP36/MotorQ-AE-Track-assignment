
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: drivers } = await supabase.from('driver').select()

  return (
    <ul>
      {drivers?.map((driver,index) => (
        <li key={index}>{driver.Driver_ID}</li>
      ))}
    </ul>
  )
}
