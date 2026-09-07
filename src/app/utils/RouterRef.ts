type NavigateFn = (to: string) => void;

let navigateFn: NavigateFn | null = null;

export const RouterRef = {
    setNavigate(fn: NavigateFn): void {
        navigateFn = fn;
    },
    navigate(to: string): void {
        if (navigateFn) {
            navigateFn(to);
        } else {
            window.location.assign(to);
        }
    },
};