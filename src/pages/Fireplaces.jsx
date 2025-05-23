import React from 'react'
import Layout from '../layout/Layout'
import ButtonStiles from '../components/ButtonStiles'

const Fireplaces = () => {
  return (
    <Layout>
        <section className='w-full bg-[url("/images/calore.webp")] bg-cover bg-center relative flex flex-col justify-center items-center pt-20 h-[60vh]'>
            <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
            <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
                <h1 className='text-white font-bold text-4xl text-center drop-shadow-md'>Stiles is the George supplier of Calore and Kamado Jan products</h1>
                {/* <div className='!text-white text-center w-full max-w-3xl'>
                    <p className='!text-white'></p>
                </div> */}
            </div>
        </section>
        <section className='container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10'>
            <div className='flex flex-col justify-start items-start gap-5 w-full'>
                <img src='/images/kamado.svg' alt='Kamado' className='w-full max-w-56 object-cover object-center' />
                <p className='text-sm'>Kamado JAN is a ceramic grill which uses lump charcoal to cook food either directly or indirectly. The secret of the Kamado JAN is the ceramic dome which not only locks in heat, but also retains moisture which results in the most deliciously cooked food.</p>
                <p className='text-sm'>The various cooking accessories available for the kamado also allow the user to cook in various styles which results in the ultimate culinary experience. The heat controls allow the user to accurately control and regulate the temperature thereby offering endless cooking possibilities.</p>
                <p className='text-sm'>It uses very little fuel as the ceramic retains the heat therefore making it more environmentally friendly than any other similar grill. The ceramic dome enjoys a limited 20 year warranty –which means that this is The Last Braai you ever Buy!</p>
                <ButtonStiles openInNewTab text='Visit National Website' styleType="dark" href='https://kamadojan.co.za/?_ga=2.175592098.1614544313.1740408143-748394691.1737046589' extraStyle="hidden lg:block text-sm" />
            </div>
            <div className='flex flex-col justify-start items-start gap-5 w-full'>
            <img src='/images/calore.svg' alt='Calore' className='w-full max-w-56 object-cover object-center' />
                <p className='text-sm'>Calore is committed to reducing South Africa’s carbon emissions by providing the consumer with technologically advanced biomass heating systems that are energy efficient, use renewable fuel, reduce strain on the electrical grid, reduce running costs and are affordable.</p>
                <p className='text-sm'>Our innovative product strategy extended further by the introduction of pellet fireplace technology to the South African market. Pellet fireplaces are a first for South Africa which are highly efficient automated heating systems currently used worldwide.</p>
                <p className='text-sm'>Pellet fireplaces are a friendly choice for the environment as they have a direct effect on reducing our carbon footprint and also assist in relieving the strain on our electrical power stations. It is for these obvious reasons that Calore has chosen to establish these cutting-edge eco-friendly heating systems in the South African market.</p>
                <ButtonStiles openInNewTab text='Visit National Website' styleType="dark" href='https://calore.co.za/?_ga=2.253704969.1614544313.1740408143-748394691.1737046589' extraStyle="hidden lg:block text-sm" />
            </div>
        </section>
    </Layout>
  )
}

export default Fireplaces