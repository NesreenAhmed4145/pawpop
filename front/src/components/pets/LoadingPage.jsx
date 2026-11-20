import puppy from "../../assets/img/puppy-loader.jpeg"
function LoadingPage() {
  return (
    <>
    <div className="col-span-full flex min-h-[60vh] flex-col items-center justify-center">

      <img
        src={puppy}
        alt="Puppy playing with a ball"
        className="w-80 sm:w-96 object-contain animate-puppy"
      />

      <h2 className="mt-5 text-2xl font-bold text-text-title">
        Finding lovely pets...
      </h2>

      <p className="mt-3 text-lg text-text-muted">
        Our furry friends are on their way! 🐾
      </p>

      <div className="mt-5 flex gap-2">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand [animation-delay:200ms]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand [animation-delay:400ms]" />
      </div>

    </div>
  
    </>
  );
}

export default LoadingPage;
