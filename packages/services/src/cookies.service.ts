const getCookie = (name: string) => {
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
    }
    return null;
};

const setCookie = (name: string, value: string, days: number): null => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    return null;
};

const deleteCookie = (name: string): null => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    return null;
};

const setLanguageCookieAndReload = async (language: string) => {
    setCookie("django_language", language, 365);
    window.location.reload();
};

export const cookiesService = {getCookie, setCookie, deleteCookie, setLanguageCookieAndReload};
