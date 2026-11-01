import { Link } from 'react-router-dom';

export default function ServerErrorPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6 py-12 font-sans">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* القسم الأيمن: النصوص والأزرار (مطابق للصورة) */}
                <div className="text-left flex flex-col items-start order-2 md:order-1">
                    <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#8C7A6B] uppercase mb-2">
                        A LITTLE HICCUP
                    </span>
                    
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-[#2C221E] mb-4">
                        500
                    </h1>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2C221E] mb-3">
                        Something went wrong.
                    </h2>
                    
                    <p className="text-sm sm:text-base text-[#6B5D54] mb-8 leading-relaxed">
                        We're having a little trouble on our end. Please try again in a moment.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#9B7B63] hover:bg-[#836752] text-white font-medium px-6 py-3 rounded-full shadow-md transition-all duration-200"
                        >
                            Try Again ⟳
                        </button>

                        <Link
                            to="/"
                            className="bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#2C221E] font-medium px-6 py-3 rounded-full transition-all duration-200"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* القسم الأيسر: الشكل البيضاوي ومكان الكلب الفارغ بدون أي أنيميشن */}
                <div className="flex justify-center items-center order-1 md:order-2">
                    <div className="w-[340px] h-[260px] sm:w-[420px] sm:h-[320px] bg-[#EFECE6] rounded-full flex items-center justify-center relative shadow-sm">
                        {/* مكان الصورة فارغ تماماً - يمكنك وضع صورتك هنا */}
                        <img 
                            src="./paw-logo2.png" 
                            alt="Server Error Illustration" 
                            className="max-h-[200px] object-contain"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}