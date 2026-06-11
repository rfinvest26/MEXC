import re

with open("constants.ts", "r", encoding="utf-8") as f:
    content = f.read()

def replace_price(match):
    num_str = match.group(1).replace("_", "")
    val = float(num_str)
    # Convert from RUB to USD (approx divide by 90)
    usd_val = val / 90.0
    
    # Format nicely
    if usd_val > 1000:
        formatted = f"{int(usd_val):_}".replace("_", "")
    elif usd_val >= 1:
        formatted = f"{usd_val:.2f}".rstrip('0').rstrip('.')
    else:
        formatted = f"{usd_val:.4f}".rstrip('0').rstrip('.')
        
    if formatted == "": formatted = "0"
    
    # exceptions
    if num_str == "90" and usd_val == 1.0: formatted = "1" # USDT
    
    return f"price: {formatted}"

new_content = re.sub(r"price:\s*([\d_.]+)", replace_price, content)

with open("constants.ts", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Prices updated successfully.")
