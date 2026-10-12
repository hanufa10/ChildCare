
using Daycare.Api.Identity;
using Daycare.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Data;

public class DaycareDbContext
    : IdentityDbContext<ApplicationUser>
{
    public DaycareDbContext(
        DbContextOptions<DaycareDbContext> options)
        : base(options)
    {
    }

    public DbSet<Child> Children { get; set; } = null!;
    public DbSet<Parent> Parents { get; set; } = null!;
    public DbSet<ParentChild> ParentChildren { get; set; } = null!;
    public DbSet<Meal> Meals { get; set; } = null!;
    public DbSet<Staff> Staff { get; set; } = null!;
    public DbSet<ChildAttendance> ChildAttendances { get; set; } = null!;
    public DbSet<StaffAttendance> StaffAttendances { get; set; } = null!;

   
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Configure Identity tables first.
    base.OnModelCreating(modelBuilder);

    // Link each staff profile to its login account.
    modelBuilder.Entity<Staff>()
        .HasOne<ApplicationUser>()
        .WithOne()
        .HasForeignKey<Staff>(s => s.ApplicationUserId)
        .IsRequired(false)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Staff>()
        .HasIndex(s => s.ApplicationUserId)
        .IsUnique();

    // Link each parent profile to its login account.
    modelBuilder.Entity<Parent>()
        .HasOne<ApplicationUser>()
        .WithOne()
        .HasForeignKey<Parent>(p => p.ApplicationUserId)
        .IsRequired(false)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Parent>()
        .HasIndex(p => p.ApplicationUserId)
        .IsUnique();

    // Preserve the existing ParentChild relationship.
    modelBuilder.Entity<ParentChild>()
        .HasKey(pc => new { pc.ParentId, pc.ChildId });

    modelBuilder.Entity<ParentChild>()
        .HasOne(pc => pc.Parent)
        .WithMany(p => p.ParentChildren)
        .HasForeignKey(pc => pc.ParentId);

    modelBuilder.Entity<ParentChild>()
        .HasOne(pc => pc.Child)
        .WithMany(c => c.ParentChildren)
        .HasForeignKey(pc => pc.ChildId);

    // Prevent duplicate attendance records for the same child/date.
    modelBuilder.Entity<ChildAttendance>()
        .HasIndex(a => new { a.ChildId, a.AttendanceDate })
        .IsUnique();

    // Prevent duplicate attendance records for the same staff/date.
    modelBuilder.Entity<StaffAttendance>()
        .HasIndex(a => new { a.StaffId, a.AttendanceDate })
        .IsUnique();
}

}
