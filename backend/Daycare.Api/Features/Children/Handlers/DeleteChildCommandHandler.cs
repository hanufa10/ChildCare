
using Daycare.Api.Data;
using Daycare.Api.Features.Children.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Features.Children.Handlers;

public class DeleteChildCommandHandler
    : IRequestHandler<DeleteChildCommand, DeleteChildResult>
{
    private readonly DaycareDbContext _context;

    public DeleteChildCommandHandler(DaycareDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteChildResult> Handle(
        DeleteChildCommand request,
        CancellationToken cancellationToken)
    {
        var child = await _context.Children
            .FirstOrDefaultAsync(
                c => c.Id == request.Id,
                cancellationToken);

        if (child == null)
        {
            return new DeleteChildResult(false, NotFound: true);
        }

        _context.Children.Remove(child);

        await _context.SaveChangesAsync(cancellationToken);

        return new DeleteChildResult(true);
    }
}
