export function getFieldSize(size) {
    switch (size){
        case "xs": return "80px"
        case "sm": return "120px"
        case "md": return "180px"
        case "lg": return "240px"
        case "xl": return "300px"
        default:return "180px"
    }
}