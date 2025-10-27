import { sendEventToAmplitude } from "../Amplitude";



interface SocialLoginFormType {
  alt: string,
  src: string,
  socialLoginUrl: string,
  type: string,
  style: string,
  title: string,
  titleStyle: string
}

export const SocialLoginForm = ({
  alt,
  src,
  socialLoginUrl,
  type,
  style,
  title,
  titleStyle,
}: SocialLoginFormType) => {
  
  const handleSocialLogin = () => {
    sendEventToAmplitude("click 3rd party sign in", { "provider type": type })
    window.location.href = socialLoginUrl;
  };

  return (
    <div className={style} onClick={handleSocialLogin}>
      <div className="flex  items-center justify-start gap-1">
        <img className="w-5 h-5 rounded-3xl" alt={alt} src={src} />
        <span className={titleStyle}>{title}</span>
      </div>
    </div>
  );
};




