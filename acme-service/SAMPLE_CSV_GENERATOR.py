"""
Sample CSV Generator for Testing
Generates a CSV file with sample product data for testing the import functionality.
"""

import csv
import random
from datetime import datetime


def generate_sample_csv(filename='sample_products.csv', num_records=1000):
    """
    Generate a sample CSV file with product data
    
    Args:
        filename: Output CSV filename
        num_records: Number of records to generate
    """
    
    # Sample data for generating realistic products
    adjectives = ['Premium', 'Deluxe', 'Standard', 'Professional', 'Basic', 
                  'Advanced', 'Elite', 'Classic', 'Modern', 'Vintage']
    
    categories = ['Widget', 'Gadget', 'Tool', 'Device', 'Equipment', 
                  'Accessory', 'Component', 'Part', 'Kit', 'System']
    
    colors = ['Red', 'Blue', 'Green', 'Black', 'White', 
              'Silver', 'Gold', 'Gray', 'Purple', 'Orange']
    
    print(f"Generating {num_records} sample products...")
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow(['sku', 'name', 'description', 'price'])
        
        # Generate records
        for i in range(1, num_records + 1):
            sku = f'SKU{i:06d}'
            
            # Generate random product name
            adj = random.choice(adjectives)
            cat = random.choice(categories)
            color = random.choice(colors)
            name = f'{adj} {color} {cat}'
            
            # Generate description
            description = f'High-quality {color.lower()} {cat.lower()} perfect for professional use. ' \
                         f'Features include durability, efficiency, and modern design.'
            
            # Generate price
            price = round(random.uniform(9.99, 999.99), 2)
            
            writer.writerow([sku, name, description, price])
            
            # Progress indicator
            if i % 1000 == 0:
                print(f"Generated {i}/{num_records} records...")
    
    print(f"\n✅ Successfully generated {filename} with {num_records} records!")


def generate_csv_with_duplicates(filename='products_with_duplicates.csv', num_records=1000):
    """
    Generate a CSV file with some duplicate SKUs to test deduplication
    
    Args:
        filename: Output CSV filename
        num_records: Number of records to generate (including duplicates)
    """
    
    print(f"Generating {num_records} records with duplicates for testing...")
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['sku', 'name', 'description', 'price'])
        
        # Generate initial records
        for i in range(1, num_records + 1):
            sku = f'SKU{i:06d}'
            name = f'Product {i}'
            description = f'Description for product {i}'
            price = round(10 + (i * 0.99), 2)
            
            writer.writerow([sku, name, description, price])
        
        # Add duplicate SKUs with updated information
        num_duplicates = int(num_records * 0.1)  # 10% duplicates
        print(f"Adding {num_duplicates} duplicate SKUs...")
        
        for i in range(1, num_duplicates + 1):
            sku = f'SKU{i:06d}'  # Reuse existing SKUs
            name = f'Updated Product {i}'
            description = f'Updated description for product {i}'
            price = round(20 + (i * 1.99), 2)
            
            writer.writerow([sku, name, description, price])
    
    print(f"\n✅ Successfully generated {filename}!")
    print(f"   ({num_records} unique + {num_duplicates} duplicates)")


if __name__ == '__main__':
    import sys
    
    print("=" * 60)
    print("Sample CSV Generator for Acme Product Importer")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        try:
            num_records = int(sys.argv[1])
        except ValueError:
            print("Invalid number. Using default of 1000 records.")
            num_records = 1000
    else:
        num_records = 1000
    
    # Generate different test files
    print("\nGenerating test CSV files...\n")
    
    # 1. Standard sample file
    generate_sample_csv('sample_products_1k.csv', 1000)
    print()
    
    # 2. File with duplicates
    generate_csv_with_duplicates('products_with_duplicates.csv', 500)
    print()
    
    # 3. Large file (if requested)
    if num_records > 1000:
        generate_sample_csv('large_products.csv', num_records)
        print()
    
    print("\n" + "=" * 60)
    print("✅ All test files generated successfully!")
    print("=" * 60)
    print("\nYou can now upload these files to test the application:")
    print("  • sample_products_1k.csv - 1,000 records")
    print("  • products_with_duplicates.csv - ~550 records (with duplicates)")
    if num_records > 1000:
        print(f"  • large_products.csv - {num_records:,} records")
    print()

